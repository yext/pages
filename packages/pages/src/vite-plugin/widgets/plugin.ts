import { build, createLogger } from "vite";
import { loadModules } from "../../common/src/loader/vite.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";
import { convertToPosixPath } from "../../common/src/template/paths.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import pc from "picocolors";
import { convertWidgetConfigToWidgetConfigInternal } from "../../common/src/template/internal/types.js";
import { WidgetModule } from "../../index.js";

export const buildWidgets = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleWidgets(projectStructure)) {
    return;
  }

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.widgets);

  const filepaths: string[] = [];
  glob
    .sync(
      convertToPosixPath(
        path.join(rootFolders.source, subfolders.widgets, "**/*.{jsx,tsx}")
      ),
      { nodir: true }
    )
    .forEach(async (f) => {
      const filepath = path.resolve(f);
      filepaths.push(filepath);
    });

  const filePathsIndexedByName = await getWidgetNames(
    filepaths,
    projectStructure
  );

  const logger = createLogger();
  const loggerInfo = logger.info;

  logger.info = (msg, options) => {
    if (msg.includes("building for production")) {
      loggerInfo(pc.green("\nBuilding widgets..."), options);
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
    build: {
      emptyOutDir: false,
      outDir: outdir,
      minify: false,
      lib: {
        entry: filePathsIndexedByName,
        formats: ["es"],
      },
      rollupOptions: {
        output: {
          format: "umd",
          entryFileNames: `[name].umd.js`,
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
};

export const shouldBundleWidgets = (projectStructure: ProjectStructure) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(path.join(rootFolders.source, subfolders.widgets));
};

const getWidgetNames = async (
  filepaths: string[],
  projectStructure: ProjectStructure
) => {
  const widgetNamesIndexedByName: { [entryAlias: string]: string } = {};
  const widgetModules = await loadModules(filepaths, true, projectStructure);

  for (let i = 0; i < widgetModules.length; i++) {
    const widgetModule = widgetModules[i].module as WidgetModule;
    const widgetName = getFileName(filepaths[i]);
    const widgetConfigInternal = convertWidgetConfigToWidgetConfigInternal(
      widgetName,
      widgetModule.config
    );
    widgetNamesIndexedByName[widgetConfigInternal.name] = filepaths[i];
  }
  return widgetNamesIndexedByName;
};

const getFileName = (path: string) => {
  const pathList = path.split("/");
  const fileNameWithExt = pathList[pathList.length - 1];
  return fileNameWithExt.substring(0, fileNameWithExt.indexOf("."));
};
