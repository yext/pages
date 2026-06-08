import { pathToFileURL } from "url";
import { UserConfig } from "vite";
import { import_ } from "./import.js";
import { getReverseProxyOverride } from "../../../util/reverseProxyOverride.js";

/**
 * Determines the assets directory to use by checking
 * the reverse proxy override, then vite.config.json's assetDir, or defaulting to "assets".
 * @param defaultAssetsDir the default directory for assets
 * @param viteConfigPath the path to vite.config.js
 */
export const determineAssetsFilepath = async (
  defaultAssetsDir: string,
  viteConfigPath: string
): Promise<string> => {
  const reverseProxyOverride = getReverseProxyOverride();
  if (reverseProxyOverride) {
    return reverseProxyOverride.assetsDir;
  }

  if (viteConfigPath === "") {
    return defaultAssetsDir;
  }

  const viteConfig = await import_(pathToFileURL(viteConfigPath).toString());
  const userConfig = viteConfig.default as UserConfig;

  return userConfig.build?.assetsDir ?? defaultAssetsDir;
};
