import { pathToFileURL } from "url";
import { UserConfig } from "vite";
import { import_ } from "./import.js";
import { sanitizeSubpath } from "./sanitizeSubpath.js";

/**
 * Determines the assets directory to use by checking vite.config.json's
 * assetDir or default to "assets". Empty values or paths that would escape
 * the output directory fall back to the default, while absolute paths are
 * sanitized into safe relative subpaths for Rollup output.
 * @param defaultAssetsDir the default directory for assets
 * @param viteConfigPath the path to vite.config.js
 */
export const determineAssetsFilepath = async (
  defaultAssetsDir: string,
  viteConfigPath: string
): Promise<string> => {
  if (viteConfigPath === "") {
    return defaultAssetsDir;
  }

  const viteConfig = await import_(pathToFileURL(viteConfigPath).toString());
  const userConfig = viteConfig.default as UserConfig;

  return sanitizeSubpath(userConfig.build?.assetsDir ?? "", defaultAssetsDir);
};
