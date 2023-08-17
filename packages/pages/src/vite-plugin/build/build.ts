import { Plugin, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import path, { parse } from "path";
import { InputOption } from "rollup";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { readdir } from "fs/promises";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { getGlobalClientServerRenderTemplates } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadFunctions } from "../../common/src/function/internal/loader.js";
import { Path } from "../../common/src/project/path.js";

const intro = `
var global = globalThis;
`;

/**
 * This plugin defines how to build the project for production. It bundles
 * assets, copies Yext plugin files that execute the bundled assets in a Deno
 * environment, and puts them all in an output directory.
 */
export const build = (projectStructure: ProjectStructure): Plugin => {
  const { envVarConfig, subfolders } = projectStructure.config;

  return {
    name: "vite-plugin:build",
    apply: "build",
    config: async (): Promise<UserConfig> => {
      return {
        envDir: envVarConfig.envVarDir,
        envPrefix: envVarConfig.envVarPrefix,
        resolve: {
          conditions: ["worker", "webworker"],
        },
        build: {
          outDir: projectStructure.config.rootFolders.dist,
          manifest: true,
          rollupOptions: {
            preserveEntrySignatures: "strict",
            input: await discoverInputs(
              projectStructure.getTemplatePaths(),
              projectStructure
            ),
            output: {
              intro,
              assetFileNames: `${subfolders.assets}/${subfolders.static}/[name]-[hash][extname]`,
              chunkFileNames: `${subfolders.assets}/${subfolders.static}/[name]-[hash].js`,
              sanitizeFileName: false,
              entryFileNames: (chunkInfo) => {
                if (chunkInfo.name.includes("functions")) {
                  return "[name]/mod.ts";
                }
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

/**
 * Produces a {@link InputOption} by adding all templates at {@link rootTemplateDir} and
 * {@link scopedTemplateDir} to be output at {@code server/}. If there are two files
 * that share the same name between the two provided template folders, only the file
 * in scoped template folder path is included. Also adds an additional entry-point
 * for all templates ending in tsx to be used to hydrate the bundle.
 *
 * @param rootTemplateDir the directory where all templates are stored.
 * @param scopedTemplateDir the directory where a subset of templates use for the build are stored.
 * @param projectStructure
 * @returns
 */
const discoverInputs = async (
  templatePaths: Path[],
  projectStructure: ProjectStructure
): Promise<InputOption> => {
  const entryPoints: Record<string, string> = {};
  const updateEntryPoints = async (dir: string) =>
    (await readdir(dir, { withFileTypes: true }))
      .filter((dirent) => !dirent.isDirectory())
      .map((file) => file.name)
      .filter(
        (f) =>
          f !== "_client17.tsx" && f !== "_client.tsx" && f !== "_server.tsx"
      )
      .forEach((template) => {
        const parsedPath = parse(template);
        const outputPath = `${projectStructure.config.subfolders.serverBundle}/${parsedPath.name}`;
        if (entryPoints[outputPath]) {
          return;
        }
        entryPoints[outputPath] = path.join(dir, template);
      });

  for (const templatePath of templatePaths) {
    await updateEntryPoints(templatePath.getAbsolutePath());
  }

  (
    await loadFunctions(
      path.join(
        projectStructure.config.rootFolders.source,
        projectStructure.config.subfolders.serverlessFunctions
      ),
      projectStructure
    )
  ).forEach((functionModule) => {
    entryPoints[
      `${projectStructure.config.subfolders.serverlessFunctions}/${functionModule.config.name}`
    ] = path.format(functionModule.filePath);
  });

  return { ...entryPoints, ...discoverRenderTemplates(projectStructure) };
};

/**
 * Produces the entry points for the client and server render templates to be output at
 * {@code render/}.
 *
 * @param projectStructure
 */
const discoverRenderTemplates = (
  projectStructure: ProjectStructure
): Record<string, string> => {
  const entryPoints: Record<string, string> = {};

  // Move the [compiled] _server.ts and _client.ts render template to /assets/render
  const clientServerRenderTemplates = getGlobalClientServerRenderTemplates(
    projectStructure.getTemplatePaths()
  );

  const { renderBundle } = projectStructure.config.subfolders;

  // server
  entryPoints[`${renderBundle}/_server`] =
    clientServerRenderTemplates.serverRenderTemplatePath;

  // client
  entryPoints[`${renderBundle}/_client`] =
    clientServerRenderTemplates.clientRenderTemplatePath;

  return entryPoints;
};
