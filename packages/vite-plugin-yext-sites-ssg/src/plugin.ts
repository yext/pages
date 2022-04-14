import { Plugin, PluginOption } from "vite";
import buildStart from "./buildStart/buildStart.js";
import onComplete from "./onComplete/onComplete.js";
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
  const closeBundle = onComplete(paths);

  return [
    {
      name: "yext-sites-ssg",
      config: async (config) => {
        await buildStart(paths);
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
            },
          },
        };
      },
      closeBundle,
    },
  ];
};

export default plugin;
