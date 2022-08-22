import { Plugin, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import { readdir } from "fs/promises";
import { parse } from "path";
import { InputOption } from "rollup";
import { ProjectStructure } from "../../common/src/project/structure.js";
import path from "path";

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
              projectStructure.hydrationBundleOutputRoot.getAbsolutePath()
            ),
            output: {
              intro,
              assetFileNames: "assets/static/[name]-[hash][extname]",
              chunkFileNames: "assets/static/[name]-[hash].js",
            },
          },
        },
      };
    },
    buildStart: buildStart(projectStructure),
    closeBundle: closeBundle(projectStructure),
  };
};

/**
 * Produces a {@link InputOption} by first adding all templates at {@link templateDir} to be output
 * at {@code server/}. Also adds an additional entry-point for all templates ending in tsx to be
 * used to hydrate the bundle.
 *
 * @param templateDir the directory where templates are stored.
 * @param hydrationOutputDir the directory where hydration inputs will be generated at.
 * @returns
 */
const discoverInputs = async (
  templateDir: string,
  hydrationOutputDir: string
): Promise<InputOption> => {
  return (await readdir(templateDir)).reduce(
    (input: Record<any, any>, template) => {
      const parsedPath = parse(template);

      if (parsedPath.ext === ".tsx" || parsedPath.ext === ".jsx") {
        input[path.join(`hydrate`, parsedPath.name)] = path
          .join(hydrationOutputDir, template)
          .replace("jsx", "tsx");
      }

      input[path.join(`server`, parsedPath.name)] = path.join(
        templateDir,
        template
      );
      return input;
    },
    {}
  );
};
