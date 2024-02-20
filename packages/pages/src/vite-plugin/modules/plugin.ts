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
import SourceFileParser, {
  createTsMorphProject,
} from "../../common/src/parsers/sourceFileParser.js";

const wrappedCode = (moduleName: string, containerName: string): string => {
  return `\nconst moduleContainerForBuildUseOnly = document.getElementById('${containerName}');
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

const moduleResponseHeader = {
  pathPattern: "^modules/.*",
  headerKey: "Access-Control-Allow-Origin",
  headerValues: ["*"],
};

export const buildModules = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleModules(projectStructure)) {
    return;
  }

  addResponseHeadersToConfigYaml(projectStructure, moduleResponseHeader);

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.modules);

  const filepaths: { [s: string]: string } = {};
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
      filepaths[moduleName] = filepath;
    });

  const logger = createLogger();
  const loggerInfo = logger.info;

  for (const [moduleName, modulePath] of Object.entries(filepaths)) {
    const index = addExtraModuleCode(modulePath, moduleName);
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        loggerInfo(pc.green(`\nBuilding ${moduleName} module...`));
        return;
      }
      loggerInfo(msg, options);
    };

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
        postcss: path.join(
          rootFolders.source,
          subfolders.modules,
          `${moduleName}/postcss.config.cjs`
        ),
      },
      build: {
        emptyOutDir: false,
        outDir: outdir,
        minify: true,
        rollupOptions: {
          input: modulePath,
          output: {
            format: "umd",
            entryFileNames: `${moduleName}.umd.js`,
          },
        },
        reportCompressedSize: false,
      },
      define: processEnvVariables(envVarConfig.envVarPrefix),
      plugins: [
        nodePolyfills({
          globals: {
            Buffer: "build",
            global: "build",
            process: "build",
          },
        }),
      ],
    });
    removeAddedModuleCode(modulePath, index);
  }
};

const shouldBundleModules = (projectStructure: ProjectStructure) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(path.join(rootFolders.source, subfolders.modules));
};

/**
 *
 * @param modulePath
 * @returns name of module if set by user, else uses file name
 */
const getModuleName = (modulePath: string): string => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  const { name } = path.parse(modulePath);
  return (
    sfp
      .getVariablePropertyByType("ModuleConfig", "name")
      ?.replace(/['"`]/g, "") ?? name
  );
};

/**
 * Adds custom code to module such that it works for user when bundled into umd.js.
 *
 * @param modulePath
 * @param name
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
