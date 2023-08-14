import fs from "node:fs";
import { pathToFileURL } from "url";
import { UserConfig } from "vite";
import { import_ } from "./import.js";

/**
 * Determines the assets directory to use by checking the following, in order:
 * TODO: Check the config.yaml first once support is added
 * 1. site-config/serving.json
 * 2. vite.config.json assetDir
 * 3. default to "assets"
 * @param servingJsonPath the path to sites-config/serving.json - make sure to take scope into account
 * @param viteConfigPath the path to vite.config.js
 */
export const determineAssetsFilepath = async (
  defaultAssetsDir: string,
  servingJsonPath: string,
  viteConfigPath: string
) => {
  if (servingJsonPath === "" || viteConfigPath === "") {
    return defaultAssetsDir;
  }

  if (fs.existsSync(servingJsonPath)) {
    const servingJson = JSON.parse(fs.readFileSync(servingJsonPath).toString());
    const displayUrlPrefix = servingJson.displayUrlPrefix as string;

    if (displayUrlPrefix === "" || !displayUrlPrefix.includes("/")) {
      return defaultAssetsDir;
    }

    const displayUrlPrefixParts = displayUrlPrefix.split("/");
    displayUrlPrefixParts.shift(); // remove the hostname

    if (displayUrlPrefixParts.length > 0) {
      return displayUrlPrefixParts.join("/");
    }

    return defaultAssetsDir;
  }

  const viteConfig = await import_(pathToFileURL(viteConfigPath).toString());
  const userConfig = viteConfig.default as UserConfig;

  return userConfig.build?.assetsDir ?? defaultAssetsDir;
};
