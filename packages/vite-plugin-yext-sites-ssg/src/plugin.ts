import { PluginOption, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import { readdir } from "fs/promises";
import { parse } from "path";
import { InputOption } from "rollup";
import {
  ProjectStructure,
  ProjectStructureConfig,
} from "../../common/src/project/structure.js";

/**
 * Options to configure functionality of the plugin.
 *
 * @public
 */
export type Options = {
  projectStructureConfig: ProjectStructureConfig;
};

const intro = `var global = globalThis;`;

const plugin = (opts: Options): PluginOption[] => {
  const projectStructure = new ProjectStructure(opts.projectStructureConfig);

  return [
    {
      name: "vite-plugin-yext-sites-ssg",
      config: async (config: UserConfig): Promise<UserConfig> => {
        return {
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
    },
  ];
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
  return (await readdir(templateDir)).reduce((input, template) => {
    const parsedPath = parse(template);

    if (parsedPath.ext.includes("tsx")) {
      input[`hydrate/${parsedPath.name}`] = `${hydrationOutputDir}/${template}`;
    }

    input[`server/${parsedPath.name}`] = `${templateDir}/${template}`;
    return input;
  }, {});
};

export default plugin;
export { plugin as yextSSG };
