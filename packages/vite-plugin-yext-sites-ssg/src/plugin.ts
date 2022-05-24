import { PluginOption, UserConfig } from "vite";
import buildStart from "./buildStart/buildStart.js";
import closeBundle from "./closeBundle/closeBundle.js";
import { readdir } from "fs/promises";
import { parse } from "path";
import pathsInit from "./paths.js";

/**
 * Options to configure functionality of the plugin.
 */
export type Options = {
  /**
   * The path to output the feature.json to. By default, this is sites-config/feature.json.
   */
  featuresOut?: string;
};

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
              input: (await readdir(paths.templateDir)).reduce(
                (input, template) => {
                  const parsedPath = parse(template);

                  if (parsedPath.ext.includes("tsx")) {
                    input[
                      `hydrate/${parsedPath.name}`
                    ] = `${paths.hydrationOutputDir}/${template}`;
                  }

                  input[
                    `server/${parsedPath.name}`
                  ] = `${paths.templateDir}/${template}`;
                  return input;
                },
                {}
              ),
              output: {
                intro: 'let global = globalThis;',
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

export default plugin;
