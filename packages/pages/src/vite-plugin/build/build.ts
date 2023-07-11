import { Plugin, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import path, { parse } from "path";
import { InputOption } from "rollup";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { readdir } from "fs/promises";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { getGlobalClientServerRenderTemplates } from "../../common/src/template/internal/getTemplateFilepaths.js";

const intro = `
var global = globalThis;
`;

/**
 * This plugin defines how to build the project for production. It bundles
 * assets, copies Yext plugin files that execute the bundled assets in a Deno
 * environment, and puts them all in an output directory.
 */
export const build = (projectStructure: ProjectStructure): Plugin => {
  return {
    name: "vite-plugin:build",
    apply: "build",
    config: async (): Promise<UserConfig> => {
      return {
        envDir: projectStructure.envVarDir,
        envPrefix: projectStructure.envVarPrefix,
        resolve: {
          conditions: ["worker", "webworker"],
        },
        build: {
          outDir: projectStructure.distRoot.path,
          manifest: true,
          rollupOptions: {
            preserveEntrySignatures: "strict",
            input: await discoverInputs(
              projectStructure.templatesRoot.getAbsolutePath(),
              projectStructure.scopedTemplatesPath?.getAbsolutePath(),
              projectStructure
            ),
            output: {
              intro,
              assetFileNames: "assets/static/[name]-[hash][extname]",
              chunkFileNames: "assets/static/[name]-[hash].js",
              entryFileNames: "assets/[name].[hash].js",
            },
          },
          reportCompressedSize: false,
        },
        define: processEnvVariables(projectStructure.envVarPrefix),
        base: "", // makes static assets relative for reverse proxies and doesn't affect non-RP sites
        experimental: {
          renderBuiltUrl(filename, { hostType }) {
            // Assets are returned with a leading slash for some reason. This adjusts the
            // paths to be relative for reverse proxy support.
            if (hostType === "js") {
              if (filename.at(0) === "/") {
                return filename.substring(1);
              }
              return filename;
            }
            return { relative: true };
          },
        },
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
  rootTemplateDir: string,
  scopedTemplateDir: string | undefined,
  projectStructure: ProjectStructure
): Promise<InputOption> => {
  const entryPoints: Record<string, string> = {};
  const updateEntryPoints = async (dir: string) =>
    (await readdir(dir, { withFileTypes: true }))
      .filter((dirent) => !dirent.isDirectory())
      .map((file) => file.name)
      .filter((f) => f !== "_client.tsx" && f !== "_server.tsx")
      .forEach((template) => {
        const parsedPath = parse(template);
        const outputPath = `server/${parsedPath.name}`;
        if (entryPoints[outputPath]) {
          return;
        }
        entryPoints[outputPath] = path.join(dir, template);
      });

  if (scopedTemplateDir) {
    await updateEntryPoints(scopedTemplateDir);
  }

  await updateEntryPoints(rootTemplateDir);

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
    projectStructure.templatesRoot,
    projectStructure.scopedTemplatesPath
  );

  // server
  let parsedPath = parse(clientServerRenderTemplates.serverRenderTemplatePath);
  let outputPath = `render/${parsedPath.name}`;
  entryPoints[outputPath] =
    clientServerRenderTemplates.serverRenderTemplatePath;

  // client
  parsedPath = parse(clientServerRenderTemplates.clientRenderTemplatePath);
  outputPath = `render/${parsedPath.name}`;
  entryPoints[outputPath] =
    clientServerRenderTemplates.clientRenderTemplatePath;

  return entryPoints;
};
