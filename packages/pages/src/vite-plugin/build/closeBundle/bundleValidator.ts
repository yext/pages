import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getBundlePaths, statSync } from "./bundleValidatorHelper.js";

/**
 * Validates the server-side bundled files.
 * @param projectStructure The ProjectStructure object containing the project configuration.
 * @param pluginFilesizeLimit The maximum size of a single plugin file in MB. Defaults to 10MB.
 * @param pluginTotalFilesizeLimit The maximum size of all plugin files combined in MB. Defaults to 10MB.
 */
export const validateBundles = (
  projectStructure: ProjectStructure,
  pluginFilesizeLimit: number,
  pluginTotalFilesizeLimit: number
) => {
  const bundlePaths = getBundlePaths(projectStructure);

  let sizeOfAllBundles = 0;
  bundlePaths.forEach((bundlePath) => {
    sizeOfAllBundles += validateFilesize(bundlePath, pluginFilesizeLimit);
  });
  validateTotalSourceSize(sizeOfAllBundles, pluginTotalFilesizeLimit);
};

/**
 * Verifies that the bundled file does not exceed the filesize limit of the Yext Plugins system.
 */
const validateFilesize = (serverBundlePath: string, pluginFilesizeLimit: number): number => {
  const stats = statSync(serverBundlePath);

  if (stats.size / (1024 * 1024) > pluginFilesizeLimit) {
    throw `Bundled file ${serverBundlePath} exceeds max size of ${pluginFilesizeLimit} MB`;
  }

  return stats.size;
};

/**
 * Verifies that the total size across all bundled files does not exceed the total cap
 * of the Yext Plugins system.
 */
const validateTotalSourceSize = (totalSizeInBytes: number, pluginTotalFilesizeLimit: number) => {
  if (totalSizeInBytes / (1024 * 1024) > pluginTotalFilesizeLimit) {
    throw `The total size of all bundles exceeds the max size of ${pluginTotalFilesizeLimit} MB`;
  }
};
