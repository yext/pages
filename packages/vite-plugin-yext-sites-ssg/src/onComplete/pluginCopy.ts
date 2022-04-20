import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import glob from "glob";

const currentPath = new URL(import.meta.url).pathname;

/**
 * Copies the Yext Plugin files from the plugins folder in dist into the top-level .yext/ directory.
 */
export const pluginCopy = (paths) => {
  const pathToPluginsDir = path.resolve(currentPath, "../../../plugin");
  const yextPluginPath = path.resolve(paths.yextDir, "./plugin");
  if (!existsSync(yextPluginPath)) {
    mkdirSync(yextPluginPath);
  }

  const pluginFiles = glob.sync(`${pathToPluginsDir}/*.ts`);
  pluginFiles.forEach((filepath) =>
    copyFileSync(filepath, `${yextPluginPath}/${path.basename(filepath)}`)
  );
};