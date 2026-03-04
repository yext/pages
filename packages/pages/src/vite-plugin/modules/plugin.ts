import { build, mergeConfig, Plugin, UserConfig } from "vite";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";
import { convertToPosixPath } from "../../common/src/template/paths.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import pc from "picocolors";
import SourceFileParser, {
  createTsMorphProject,
} from "../../common/src/parsers/sourceFileParser.js";
import { logErrorAndExit, logWarning } from "../../util/logError.js";
import postcss from "postcss";
import nested from "postcss-nested";
import { createModuleLogger } from "../../common/src/module/internal/logger.js";
import { getModuleName } from "../../common/src/module/internal/getModuleConfig.js";
import { scopedViteConfigPath } from "../../util/viteConfig.js";

type FileInfo = {
  path: string;
  name: string;
  isScoped: boolean;
};

export const buildModules = async (projectStructure: ProjectStructure): Promise<void> => {
  if (!shouldBundleModules(projectStructure)) {
    return;
  }

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.modules);

  const filepaths: { [s: string]: FileInfo } = {};
  const scopedModulesRoot = projectStructure.config.scope
    ? path.resolve(rootFolders.source, subfolders.modules, projectStructure.config.scope)
    : undefined;
  const modulePaths = projectStructure.getModulePaths();
  modulePaths.forEach((modulePath) => {
    const isScopedPath =
      scopedModulesRoot !== undefined && path.resolve(modulePath.path) === scopedModulesRoot;
    glob
      .sync(convertToPosixPath(path.join(modulePath.path, "*/*.{jsx,tsx}")), {
        nodir: true,
      })
      .forEach((f) => {
        const filepath = path.resolve(f);
        const moduleName = getModuleName(filepath);
        const { name } = path.parse(filepath);
        const resolvedModuleName = moduleName ?? name;
        const existing = filepaths[resolvedModuleName];
        // If that name exists already, don't overwrite the filepaths.
        // Example, if scope is declared, the scoped module's info should stay
        // in filepaths and not be overwritten by a non-scoped module.
        if (existing) {
          if (existing.isScoped && !isScopedPath) {
            return;
          }
          if (!existing.isScoped && isScopedPath) {
            filepaths[resolvedModuleName] = { path: filepath, name: name, isScoped: true };
            return;
          }
          logErrorAndExit(
            `Duplicate module name "${resolvedModuleName}" found in:\n` +
              `- ${existing.path}\n` +
              `- ${filepath}\n` +
              `Module names must be unique.`
          );
        }
        filepaths[resolvedModuleName] = { path: filepath, name: name, isScoped: isScopedPath };
      });
  });

  const moduleEntryNames = new Map<string, string>();
  const moduleByEntryName = new Map<string, string>();
  for (const moduleName of Object.keys(filepaths)) {
    const entryName = sanitizeModuleEntryName(moduleName);
    const existingModule = moduleByEntryName.get(entryName);
    if (existingModule) {
      logErrorAndExit(
        `Module names "${existingModule}" and "${moduleName}" resolve to the same ` +
          `output filename "${entryName}.umd.js". Rename modules to be unique.`
      );
    }
    moduleByEntryName.set(entryName, moduleName);
    moduleEntryNames.set(moduleName, entryName);
  }

  const logger = createModuleLogger();
  const loggerInfo = logger.info;

  if (tailwindBaseExists()) {
    // TODO add link to recommended implementation for user.
    logWarning(
      `Please be aware that using @tailwind base applies styles globally. This can affect code outside of the widget.`
    );
  }

  const viteConfigPath = scopedViteConfigPath(projectStructure.config.scope);
  const viteConfigModule = viteConfigPath ? await import(viteConfigPath) : "";
  const viteConfig = viteConfigModule ? (viteConfigModule.default as UserConfig) : undefined;

  for (const [moduleName, fileInfo] of Object.entries(filepaths)) {
    const safeModuleEntryName =
      moduleEntryNames.get(moduleName) ?? sanitizeModuleEntryName(moduleName);
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        loggerInfo(pc.green(`\nBuilding ${moduleName} module...`));
        return;
      }
      loggerInfo(msg, options);
    };

    const moduleBuildConfig = {
      customLogger: logger,
      configFile: false,
      envDir: envVarConfig.envVarDir,
      envPrefix: envVarConfig.envVarPrefix,
      resolve: {
        conditions: ["worker", "webworker"],
      },
      publicDir: false,
      css: {
        postcss: getPostCssConfigFilepath(rootFolders, subfolders, fileInfo.name),
      },
      esbuild: {
        logOverride: {
          "css-syntax-error": "silent",
        },
      },
      experimental: {
        renderBuiltUrl(filename: string, { type }: { type: "asset" | "public" }) {
          let domain = `http://localhost:8000`;
          if (typeof process.env.YEXT_SITE_ARGUMENT !== "undefined") {
            try {
              domain = new URL(
                "https://" + JSON.parse(process.env.YEXT_SITE_ARGUMENT).productionDomain
              ).toString();
            } catch (_) {
              logErrorAndExit("Cannot parse YEXT_SITE_ARGUMENT");
            }
          }
          if (type === "asset" && domain) {
            return `${domain}/${subfolders.modules}/${filename}`;
          }
          return filename;
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
            entryFileNames: `${safeModuleEntryName}.umd.js`,
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
    };

    await build(mergeConfig(cleanseUserViteConfig(viteConfig), moduleBuildConfig));
  }
};

const wrappedCode = (moduleName: string, containerName: string): string => {
  return `
  const moduleContainerForBuildUseOnly = document.getElementById('${containerName}');
  if (!moduleContainerForBuildUseOnly) {
    throw new Error('could not find ${containerName} element');
  }
  createRoot(moduleContainerForBuildUseOnly).render(
    <${moduleName}/>
  );`;
};

export default function addWrappedCodePlugin(path: string, moduleName: string): Plugin {
  return {
    name: "wrapped-code-plugin",
    enforce: "pre",
    transform(source: string, id: string) {
      if (id === path) {
        return getReactImports(source) + source + extraModuleCode(path, moduleName);
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
  if (!hasCreateRootImportFromReactDomClient(source)) {
    imports += `import { createRoot } from 'react-dom/client';\n`;
  }
  return imports;
};

const hasCreateRootImportFromReactDomClient = (source: string): boolean =>
  /import\s+(?!type\b)[\s\S]*\{[\s\S]*\bcreateRoot(?:\s+as\s+createRoot)?\b[\s\S]*\}\s+from\s+['"]react-dom\/client['"]/.test(
    source
  );

const shouldBundleModules = (projectStructure: ProjectStructure) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(path.join(rootFolders.source, subfolders.modules));
};

/**
 * Sanitizes module names used for entryFileNames to avoid path traversal and
 * keep output files within the Rollup output directory.
 */
const sanitizeModuleEntryName = (moduleName: string): string => {
  const normalized = path.posix.normalize(moduleName.replace(/\\/g, "/")).replace(/^(\.\/)+/, "");
  const safeName = normalized
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("-");

  return safeName.length > 0 ? safeName : "module";
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
  const filePath = path.join(rootFolders.source, subfolders.modules, `${filename}/postcss.config`);
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
    } catch (_) {
      // Purposefully ignore error, in case user has odd file we want to skip.
      return false;
    }
  }
  return false;
};

/**
 * Removes items from the user-defined vite config that clash with the module build process.
 */
const cleanseUserViteConfig = (config?: UserConfig) => {
  if (!config) {
    return {};
  }
  config.plugins = [];

  if (config.build?.rollupOptions?.output) {
    config.build.rollupOptions.output = undefined;
  }

  return config;
};
