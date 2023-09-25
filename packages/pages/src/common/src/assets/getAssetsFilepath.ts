import fs from "node:fs";
import { pathToFileURL } from "url";
import { UserConfig } from "vite";
import { import_ } from "./import.js";
import yaml from "yaml";

/**
 * Determines the assets directory to use by checking the following, in order:
 * 1. config.yaml
 * 2. vite.config.json assetDir
 * 3. default to "assets"
 * @param defaultAssetsDir the default directory for assets
 * @param configYamlPath the path to config.yaml
 * @param viteConfigPath the path to vite.config.js
 */
export const determineAssetsFilepath = async (
  defaultAssetsDir: string,
  configYamlPath: string,
  viteConfigPath: string
): Promise<string> => {
  if (configYamlPath === "" || viteConfigPath === "") {
    return defaultAssetsDir;
  }

  if (fs.existsSync(configYamlPath)) {
    const configYaml = yaml.parseDocument(
      fs.readFileSync(configYamlPath, "utf-8")
    );
    if (configYaml !== null) {
      const assetsDir = configYaml.get("assetsDir");
      if (assetsDir !== null && assetsDir !== "") {
        return assetsDir as string;
      }
    }
  }

  const viteConfig = await import_(pathToFileURL(viteConfigPath).toString());
  const userConfig = viteConfig.default as UserConfig;

  return userConfig.build?.assetsDir ?? defaultAssetsDir;
};
