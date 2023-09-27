import path from "path";
import { access, readFile } from "fs/promises";
import { Plugin, PluginBuild } from "esbuild";
import { BUILT_IN_ESBUILD_LOADERS, COMMON_ESBUILD_LOADERS } from "./esbuild.js";

/**
 * Load any unknown filetype.
 */
export const anyFileLoader = ({ fsCheck = true } = {}): Plugin => {
  const loaders = [
    ...Object.keys(BUILT_IN_ESBUILD_LOADERS),
    ...Object.keys(COMMON_ESBUILD_LOADERS),
  ];

  const plugin = {
    name: "any-file-loader",
    setup(build: PluginBuild) {
      build.onLoad({ filter: /./ }, async (args) => {
        if (loaders.includes(path.extname(args.path))) {
          return;
        }

        if (fsCheck) {
          await access(args.path);
        }

        return {
          contents: await readFile(args.path),
          loader: "file",
        };
      });
    },
  };

  return plugin;
};
