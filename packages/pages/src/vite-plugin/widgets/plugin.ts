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

export const buildWidgets = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleWidgets(projectStructure)) {
    return;
  }

  // wrap widget in code here
  addResponseHeadersToConfigYaml(projectStructure, {
    pathPattern: "^widgets/.*",
    headerKey: "Access-Control-Allow-Origin",
    headerValues: ["*"],
  });

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.widgets);

  // TODO use config name rather than file name
  const filepaths: { [s: string]: string } = {};
  glob
    .sync(
      convertToPosixPath(
        path.join(rootFolders.source, subfolders.widgets, "**/*.{jsx,tsx}")
      ),
      { nodir: true }
    )
    .forEach((f) => {
      const filepath = path.resolve(f);
      const { name } = path.parse(filepath);
      filepaths[name] = filepath;
    });

  const logger = createLogger();
  const loggerInfo = logger.info;

  for (const [widgetName, widgetPath] of Object.entries(filepaths)) {
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        loggerInfo(pc.green(`\nBuilding ${widgetName} widget...`));
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
          subfolders.widgets,
          `${widgetName}/postcss.config.cjs`
        ),
      },
      build: {
        emptyOutDir: false,
        outDir: outdir,
        minify: false,
        rollupOptions: {
          input: widgetPath,
          output: {
            format: "umd",
            entryFileNames: `${widgetName}.umd.js`,
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
  }
};

const shouldBundleWidgets = (projectStructure: ProjectStructure) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(path.join(rootFolders.source, subfolders.widgets));
};
