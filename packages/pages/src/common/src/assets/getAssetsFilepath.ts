import fs from "node:fs";
import { pathToFileURL } from "url";
import { UserConfig } from "vite";
import { import_ } from "./import.js";
import yaml from "js-yaml";
import { ConfigYaml } from "../config/config.js";

/**
 * Determines the assets directory to use by checking the following, in order:
 * 1. config.yaml
 * 2. vite.config.json assetDir
 * 3. default to "assets"
 * @param servingJsonPath the path to sites-config/serving.json - make sure to take scope into account
 * @param viteConfigPath the path to vite.config.js
 */
export const determineAssetsFilepath = async (
  defaultAssetsDir: string,
  configYamlPath: string,
  viteConfigPath: string
) => {
  if (configYamlPath === "" || viteConfigPath === "") {
    return defaultAssetsDir;
  }

  if (fs.existsSync(configYamlPath)) {
    const configYaml = yaml.load(
      fs.readFileSync(configYamlPath, "utf-8")
    ) as ConfigYaml;

    if (configYaml.assetsDir && configYaml.assetsDir !== "") {
      return configYaml.assetsDir;
    }
  }

  const viteConfig = await import_(pathToFileURL(viteConfigPath).toString());
  const userConfig = viteConfig.default as UserConfig;

  return userConfig.build?.assetsDir ?? defaultAssetsDir;
};
