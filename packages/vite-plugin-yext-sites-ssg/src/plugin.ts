import { PluginOption, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import { readdir } from "fs/promises";
import { parse } from "path";
import pathsInit from "./paths.js";
import { InputOption } from "rollup";

/**
 * Options to configure functionality of the plugin.
 */
export type Options = {
  /**
   * The path to output the feature.json to. By default, this is sites-config/feature.json.
   */
  featuresOut?: string;
};

const intro = `var global = globalThis;`;

const plugin = (opts: Options = {}): PluginOption[] => {
  const paths = pathsInit({ featuresOut: opts.featuresOut });

  return [
    {
      name: "vite-plugin-yext-sites-ssg",
      config: async (config: UserConfig): Promise<UserConfig> => {
        return {
          build: {
            manifest: true,
            rollupOptions: {
              preserveEntrySignatures: "strict",
              input: await discoverInputs(
                paths.templateDir,
                paths.hydrationOutputDir
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
      buildStart: buildStart(paths),
      closeBundle: closeBundle(paths),
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
