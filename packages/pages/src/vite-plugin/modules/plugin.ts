import { build, Plugin } from "vite";
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
import { logWarning } from "../../util/logError.js";
import postcss from "postcss";
import nested from "postcss-nested";
import { createModuleLogger } from "../../common/src/module/internal/logger.js";

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

  const logger = createModuleLogger();

  if (tailwindBaseExists()) {
    // TODO add link to recommended implementation for user.
    logWarning(
      `Please be aware that using @tailwind base applies styles globally. This can affect code outside of the widget.`
    );
  }

  for (const [moduleName, fileInfo] of Object.entries(filepaths)) {
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        logger.info(pc.green(`\nBuilding ${moduleName} module...`));
        return;
      }
      logger.info(msg, options);
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
      "# The ^modules/ header allows access to your modules from other sites\n"
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
        postcss: getPostCssConfigFilepath(
          rootFolders,
          subfolders,
          fileInfo.name
        ),
      },
      esbuild: {
        logOverride: {
          "css-syntax-error": "silent",
        },
      },
      build: {
        chunkSizeWarningLimit: 2000,
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
        addWrappedCodePlugin(fileInfo.path, moduleName),
        nodePolyfills({
          globals: {
            Buffer: "build",
            global: "build",
            process: "build",
          },
        }),
      ],
    });
  }
};

const wrappedCode = (moduleName: string, containerName: string): string => {
  return `
  const moduleContainerForBuildUseOnly = document.getElementById('${containerName}');
  if (!moduleContainerForBuildUseOnly) {
    throw new Error('could not find ${containerName} element');
  }
  ReactDOM.render(
    <${moduleName}/>,
    moduleContainerForBuildUseOnly
  );`;
};

export default function addWrappedCodePlugin(
  path: string,
  moduleName: string
): Plugin {
  return {
    name: "wrapped-code-plugin",
    enforce: "pre",
    transform(source: string, id: string) {
      if (id === path) {
        return (
          getReactImports(source) + source + extraModuleCode(path, moduleName)
        );
      }
      return null;
    },
  };
}

const getReactImports = (source: string): string => {
  let imports = "";
  if (!(source.includes(`from 'react'`) || source.includes(`from "react"`))) {
    imports += `import * as React from 'react';\n`;
  }
  if (
    !(
      source.includes(`from 'react-dom'`) || source.includes(`from "react-dom"`)
    )
  ) {
    imports += `import * as ReactDOM from 'react-dom';\n`;
  }
  return imports;
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
export const getModuleName = (modulePath: string): string | undefined => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  return sfp.getVariablePropertyByName("config", "name")?.replace(/['"`]/g, "");
};

/**
 * Adds custom code to module when bundled into umd.js.
 *
 * @param modulePath
 * @param name set by ModuleConfig or filename
 */
const extraModuleCode = (modulePath: string, name: string) => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  const declaration = sfp.getVariableDeclarationByType("Module");
  if (declaration === undefined) {
    throw new Error(`Cannot find variable Module in ${modulePath}`);
  }
  const moduleName = declaration.getName();
  return wrappedCode(moduleName, name);
};

/**
 * Returns the postcss.config filepath if it exists in the module.
 * Else returns the root postcss.config filepath.
 * If there is none, throws error.
 *
 * @param rootFolders
 * @param subfolders
 * @param filename of module
 * @returns string
 */
const getPostCssConfigFilepath = (
  rootFolders: any,
  subfolders: any,
  filename: string
): string | undefined => {
  const filePath = path.join(
    rootFolders.source,
    subfolders.modules,
    `${filename}/postcss.config`
  );
  let filePaths = glob.sync(filePath + ".{js,cjs,ts,mjs}");
  if (filePaths.length == 1) {
    return filePaths[0];
  }

  filePaths = glob.sync("postcss.config" + ".{js,cjs,ts,mjs}");
  if (filePaths.length == 1) {
    return filePaths[0];
  }

  return;
};

/**
 * Looks at all css files in src and returns true
 * if there is an unwrapped tailwind base.
 *
 * @returns boolean
 */
const tailwindBaseExists = (): boolean => {
  const files = glob.sync("./src/**/*.css");
  let isTailwindBaseInRule = false;
  for (const filePath of files) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      postcss([nested])
        .process(data, { from: undefined })
        .then((result) => {
          result.root.walkRules((rule) => {
            // Check if the rule contains @tailwind base
            if (rule.toString().includes("@tailwind base")) {
              isTailwindBaseInRule = true;
            }
          });
        })
        .then(() => {
          if (data.includes(`@tailwind base`) && !isTailwindBaseInRule) {
            return true;
          }
        });
    } catch (err) {
      // Purposefully ignore error, in case user has odd file we want to skip.
      return false;
    }
  }
  return false;
};
