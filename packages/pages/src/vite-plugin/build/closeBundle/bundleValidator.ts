import { statSync } from "fs";
import glob from "glob";
import path from "path";

const PLUGIN_FILESIZE_LIMIT = 1.5; // MB
const PLUGIN_TOTAL_FILESIZE_LIMIT = 10; // MB

/**
 * Validates the server-side bundled files.
 */
export const validateBundles = () => {
  const bundlePaths = getBundlePaths();

  let sizeOfAllBundles = 0;
  bundlePaths.forEach((bundlePath) => {
    sizeOfAllBundles += validateFilesize(bundlePath);
  });
  validateTotalSourceSize(sizeOfAllBundles);
};

const getBundlePaths = (): string[] => {
  return glob.sync(
    `${path.resolve("dist/assets")}/{renderer,server,static}/**/*.*`
  );
};

/**
 * Verifies that the bundled file does not exceed the filesize limit of the Yext Plugins system.
 */
const validateFilesize = (serverBundlePath: string): number => {
  const stats = statSync(serverBundlePath);
  if (stats.size / (1024 * 1024) > PLUGIN_FILESIZE_LIMIT) {
    throw new Error(
      `Bundled file ${serverBundlePath} exceeds max size of ${PLUGIN_FILESIZE_LIMIT} MB`
    );
  }

  return stats.size;
};

/**
 * Verifies that the total size across all bundled files does not exceed the total cap
 * of the Yext Plugins system.
 */
const validateTotalSourceSize = (totalSizeInBytes: number) => {
  if (totalSizeInBytes / (1024 * 1024) > PLUGIN_TOTAL_FILESIZE_LIMIT) {
    throw new Error(
      `The total size of all bundles exceeds the max size of ${PLUGIN_TOTAL_FILESIZE_LIMIT} MB`
    );
  }
};