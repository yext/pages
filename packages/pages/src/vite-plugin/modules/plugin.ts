import { build, createLogger } from "vite";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";
import { convertToPosixPath } from "../../common/src/template/paths.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import pc from "picocolors";
import { addResponseHeadersToConfigYaml } from "../../util/editConfigYaml.js";
// @ts-expect-error due to type any
import scopeTailwind from "vite-plugin-scope-tailwind";
import SourceFileParser, {
  createTsMorphProject,
} from "../../common/src/parsers/sourceFileParser.js";

const postcssExtensions = ["cjs", "js", "ts", "mjs"];

const wrappedCode = (moduleName: string, containerName: string): string => {
  return `
// The following code is added during build and removed after build is completed.
const moduleContainerForBuildUseOnly = document.getElementById('${containerName}');
if (!moduleContainerForBuildUseOnly) {
  throw new Error('could not find ${containerName} element');
}

ReactDOM.render(
  <React.StrictMode>
    <${moduleName}/>
  </React.StrictMode>,
  moduleContainerForBuildUseOnly
);
  `;
};

const moduleResponseHeaderProps = {
  headerKey: "Access-Control-Allow-Origin",
  headerValues: ["*"],
};

type FileInfo = {
  path: string;
  name: string;
};

export const buildModules = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleModules(projectStructure)) {
    return;
  }

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.modules);

  const filepaths: { [s: string]: FileInfo } = {};
  glob
    .sync(
      convertToPosixPath(
        path.join(rootFolders.source, subfolders.modules, "**/*.{jsx,tsx}")
      ),
      { nodir: true }
    )
    .forEach((f) => {
      const filepath = path.resolve(f);
      const moduleName = getModuleName(filepath);
      const { name } = path.parse(filepath);
      filepaths[moduleName ?? name] = { path: filepath, name: name };
    });

  const logger = createLogger();
  const loggerInfo = logger.info;

  for (const [moduleName, fileInfo] of Object.entries(filepaths)) {
    const index = addExtraModuleCode(fileInfo.path, moduleName);
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        loggerInfo(pc.green(`\nBuilding ${moduleName} module...`));
        return;
      }
      loggerInfo(msg, options);
    };

    // For each module, add response header to config.yaml.
    // Users can manually adjust headerKey and headerValue in their config.yaml.
    // As long as pathPattern matches, it won't be overwitten.
    addResponseHeadersToConfigYaml(
      projectStructure,
      {
        pathPattern: `^modules/${moduleName}.*`,
        ...moduleResponseHeaderProps,
      },
      " This response header allows access to your modules from other sites"
    );

    await build({
      customLogger: logger,
      configFile: false,
      envDir: envVarConfig.envVarDir,
      envPrefix: envVarConfig.envVarPrefix,
      resolve: {
        conditions: ["worker", "webworker"],
      },
      publicDir: false,
      css: {
        postcss: getPostcssConfigFilepath(
          rootFolders,
          subfolders,
          fileInfo.name
        ),
      },
      build: {
        emptyOutDir: false,
        outDir: outdir,
        minify: true,
        rollupOptions: {
          input: fileInfo.path,
          output: {
            format: "umd",
            entryFileNames: `${moduleName}.umd.js`,
          },
        },
        reportCompressedSize: false,
      },
      define: processEnvVariables(envVarConfig.envVarPrefix),
      plugins: [
        scopeTailwind({ react: true }),
        nodePolyfills({
          globals: {
            Buffer: "build",
            global: "build",
            process: "build",
          },
        }),
      ],
    });
    removeAddedModuleCode(fileInfo.path, index);
  }
};

const shouldBundleModules = (projectStructure: ProjectStructure) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(path.join(rootFolders.source, subfolders.modules));
};

/**
 *
 * @param modulePath
 * @returns name of module if set by user via ModuleConfig
 */
const getModuleName = (modulePath: string): string | undefined => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  return sfp
    .getVariablePropertyByType("ModuleConfig", "name")
    ?.replace(/['"`]/g, "");
};

/**
 * Adds custom code to module such that it works for user when bundled into umd.js.
 *
 * @param modulePath
 * @param name set by ModuleConfig or filename
 * @returns number of added index
 */
const addExtraModuleCode = (modulePath: string, name: string): number => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  const declaration = sfp.getVariableDeclarationByType("Module");
  if (declaration === undefined) {
    throw new Error(`Cannot find variable Module in ${modulePath}`);
  }
  const moduleName = declaration.getName();
  const insertIndex = sfp.getEndPos();
  const afterInsertIndex = sfp.insertStatement(
    wrappedCode(moduleName, name),
    insertIndex
  );
  sfp.addReactImports();
  sfp.save();
  return afterInsertIndex - insertIndex;
};

/**
 * Removes the custom code we added after bundling is done.
 * @param modulePath
 * @param index index added (such as via addExtraModuleCode)
 */
const removeAddedModuleCode = (modulePath: string, index: number) => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  sfp.removeStatement(sfp.getEndPos() - index, sfp.getEndPos());
  sfp.removeUnusedImports();
  sfp.save();
};

const getPostcssConfigFilepath = (
  rootFolders: any,
  subfolders: any,
  filename: string
): string => {
  for (const extension of postcssExtensions) {
    const filePath = path.join(
      rootFolders.source,
      subfolders.modules,
      `${filename}/postcss.config.${extension}`
    );
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // Use root config if one isn't found in module
  for (const extension of postcssExtensions) {
    const filePath = path.join(`postcss.config.${extension}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  throw new Error(`Cannot find a postcss.config file for ${filename}`);
};
