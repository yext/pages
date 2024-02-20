import { Plugin, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { buildServerlessFunctions } from "../serverless-functions/plugin.js";
import { buildModules } from "../modules/plugin.js";

const intro = `
var global = globalThis;
`;

/**
 * This plugin defines how to build the project for production. It bundles
 * assets, copies Yext plugin files that execute the bundled assets in a Deno
 * environment, and puts them all in an output directory.
 */
export const build = async (
  projectStructure: ProjectStructure
): Promise<Plugin> => {
  const { envVarConfig, subfolders } = projectStructure.config;

  return {
    name: "vite-plugin:build",
    apply: "build",
    /**
     * Vite builds a single bundle. We need multiple bundles: GenerationPlugin (server), renderer, client,
     * serverless functions. The user's package.json scripts will invoke the Vite CLI to execute the server
     * build. We then use this hook to kick off builds for the other bundles.
     *
     * Note that writeBundle executes before the main server plugin is bundled.
     */
    writeBundle: {
      sequential: true,
      handler: async (): Promise<void> => {
        await buildServerlessFunctions(projectStructure);
        await buildModules(projectStructure);
      },
    },
    config: async (): Promise<UserConfig> => {
      return {
        envDir: envVarConfig.envVarDir,
        envPrefix: envVarConfig.envVarPrefix,
        resolve: {
          conditions: ["worker", "webworker"],
        },
        publicDir: false,
        build: {
          outDir: projectStructure.config.rootFolders.dist,
          manifest: true,
          rollupOptions: {
            preserveEntrySignatures: "strict",
            output: {
              intro,
              assetFileNames: `${subfolders.assets}/${subfolders.static}/[name]-[hash][extname]`,
              chunkFileNames: `${subfolders.assets}/${subfolders.static}/[name]-[hash].js`,
              sanitizeFileName: false,
              entryFileNames: () => {
                return `${subfolders.assets}/[name].[hash].js`;
              },
              manualChunks: (id) => {
                // Fixes an error where the output is prefixed like \x00commonjsHelpers-hash.js
                if (id.includes("commonjsHelpers")) return "commonjsHelpers";
              },
            },
          },
          reportCompressedSize: false,
          assetsDir: subfolders.assets,
        },
        define: processEnvVariables(envVarConfig.envVarPrefix),
      };
    },
    buildStart: buildStart(projectStructure),
    closeBundle: closeBundle(projectStructure),
  };
};
