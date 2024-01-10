import { build, createLogger } from "vite";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";
import { convertToPosixPath } from "../../common/src/template/paths.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import pc from "picocolors";

export const buildWidgets = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleWidgets(projectStructure)) {
    return;
  }

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.widgets);

  const filepaths: { [entryAlias: string]: string } = {};
  glob
    .sync(
      convertToPosixPath(
        path.join(rootFolders.source, subfolders.widgets, "**/*.{jsx,tsx}")
      ),
      { nodir: true }
    )
    .forEach((f) => {
      const filepath = path.resolve(f);
      const name = getFilePathName(filepath);
      filepaths[name] = filepath;
    });

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
        entry: filepaths,
        formats: ["es"],
      },
      rollupOptions: {
        output: {
          format: "umd",
          entryFileNames: `[name]/search.umd.js`,
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

const getFilePathName = (filepath: string) => {
  const paths = filepath.split("/");
  const lastElement = paths.length - 1;
  return paths[lastElement];
};
