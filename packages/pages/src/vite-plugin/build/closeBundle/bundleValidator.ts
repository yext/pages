import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getBundlePaths, statSync } from "./bundleValidatorHelper.js";

const PLUGIN_FILESIZE_LIMIT = 10; // MB
const PLUGIN_TOTAL_FILESIZE_LIMIT = 10; // MB

/**
 * Validates the server-side bundled files.
 */
export const validateBundles = (projectStructure: ProjectStructure) => {
  const bundlePaths = getBundlePaths(projectStructure);

  let sizeOfAllBundles = 0;
  bundlePaths.forEach((bundlePath) => {
    sizeOfAllBundles += validateFilesize(bundlePath);
  });
  validateTotalSourceSize(sizeOfAllBundles);
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
