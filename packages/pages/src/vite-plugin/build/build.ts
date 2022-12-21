import { Plugin, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import path, { parse } from "path";
import { InputOption } from "rollup";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { readdir } from "fs/promises";
import { processEnvVariables } from "../../util/processEnvVariables.js";

const intro = `var global = globalThis;`;

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
        build: {
          outDir: projectStructure.distRoot.path,
          manifest: true,
          rollupOptions: {
            preserveEntrySignatures: "strict",
            input: await discoverInputs(
              projectStructure.templatesRoot.getAbsolutePath(),
              projectStructure.scopedTemplatesPath?.getAbsolutePath(),
              projectStructure.hydrationBundleOutputRoot.getAbsolutePath()
            ),
            output: {
              intro,
              assetFileNames: "assets/static/[name]-[hash][extname]",
              chunkFileNames: "assets/static/[name]-[hash].js",
            },
          },
        },
        define: processEnvVariables(projectStructure.envVarPrefix),
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
 * @param hydrationOutputDir the directory where hydration inputs will be generated at.
 * @returns
 */
const discoverInputs = async (
  rootTemplateDir: string,
  scopedTemplateDir: string | undefined,
  hydrationOutputDir: string
): Promise<InputOption> => {
  const entryPoints: Record<string, string> = {};
  const updateEntryPoints = async (dir: string) =>
    (await readdir(dir, { withFileTypes: true }))
      .filter((dirent) => !dirent.isDirectory())
      .map((file) => file.name)
      .forEach((template) => {
        const parsedPath = parse(template);
        const outputPath = `server/${parsedPath.name}`;
        if (entryPoints[outputPath]) {
          return;
        }
        entryPoints[outputPath] = path.join(dir, template);
        if (parsedPath.ext === ".tsx" || parsedPath.ext === ".jsx") {
          entryPoints[`hydrate/${parsedPath.name}`] = path
            .join(hydrationOutputDir, template)
            .replace("jsx", "tsx");
        }
      });

  if (scopedTemplateDir) {
    await updateEntryPoints(scopedTemplateDir);
  }
  await updateEntryPoints(rootTemplateDir);
  return entryPoints;
};
