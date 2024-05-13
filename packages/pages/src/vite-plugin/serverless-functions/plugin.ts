import { build, createLogger } from "vite";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";
import { convertToPosixPath } from "../../common/src/template/paths.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { FunctionMetadataParser } from "../../common/src/function/internal/functionMetadataParser.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import pc from "picocolors";
import { scopedViteConfigPath } from "../../util/viteConfig.js";

export const buildServerlessFunctions = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleServerlessFunctions(projectStructure)) {
    return;
  }

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.serverlessFunctions);

  const filepaths: { [entryAlias: string]: string } = {};
  glob
    .sync(
      convertToPosixPath(
        path.join(
          rootFolders.source,
          subfolders.serverlessFunctions,
          "**/*.{js,ts}"
        )
      ),
      { nodir: true }
    )
    .forEach((f) => {
      const filepath = path.resolve(f);
      const fmp = new FunctionMetadataParser(filepath, projectStructure);
      const { name } = fmp.functionMetadata;
      filepaths[name] = filepath;
    });

  const logger = createLogger();
  const loggerInfo = logger.info;

  const viteConfig = await import(
    scopedViteConfigPath(projectStructure.config.scope) ?? ""
  );
  const config = viteConfig?.default;
  const filteredPlugins = config?.plugins?.[0]?.filter(
    (obj: any) => obj.name !== "vite:react-refresh"
  );

  for (const [name, filepath] of Object.entries(filepaths)) {
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        loggerInfo(
          pc.green(`\nBuilding serverless function ${name}...`),
          options
        );
        return;
      }
      loggerInfo(msg, options);
    };

    await build({
      ...config,
      customLogger: logger,
      configFile: false,
      envDir: envVarConfig.envVarDir,
      envPrefix: envVarConfig.envVarPrefix,
      resolve: {
        ...config?.resolve,
        conditions: ["worker", "webworker"],
      },
      publicDir: false,
      build: {
        ...config?.build,
        emptyOutDir: false,
        outDir: outdir,
        minify: false,
        lib: {
          ...config?.build?.lib,
          entry: { [name]: filepath },
          formats: ["es"],
        },
        rollupOptions: {
          ...config?.build?.rollupOptions,
          output: {
            // must use this over lib.fileName otherwise it always ends in .js
            entryFileNames: `[name]/mod.ts`,
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
        ...filteredPlugins,
      ],
    });
  }
};

export const shouldBundleServerlessFunctions = (
  projectStructure: ProjectStructure
) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(
    path.join(rootFolders.source, subfolders.serverlessFunctions)
  );
};
