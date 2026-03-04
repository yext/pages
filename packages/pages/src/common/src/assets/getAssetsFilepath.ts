import { pathToFileURL } from "url";
import path from "node:path";
import { UserConfig } from "vite";
import { import_ } from "./import.js";

/**
 * Determines the assets directory to use by checking
 * vite.config.json's assetDir or default to "assets".
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

  return sanitizeAssetsDir(userConfig.build?.assetsDir ?? defaultAssetsDir, defaultAssetsDir);
};

/**
 * Ensures the assets directory is a safe, relative subpath for Rollup output.
 * Falls back when the value is empty, absolute, or would escape the output dir.
 */
const sanitizeAssetsDir = (assetsDir: string, fallback: string): string => {
  const trimmed = assetsDir.trim();
  if (trimmed.length === 0) {
    return fallback;
  }

  const withoutDrive = trimmed.replace(/^[a-zA-Z]:/, "");
  const withoutLeading = withoutDrive.replace(/^[/\\]+/, "");
  const normalized = path.posix
    .normalize(withoutLeading.replace(/\\/g, "/"))
    .replace(/^(\.\/)+/, "");

  if (normalized === "" || normalized === "." || normalized.startsWith("..")) {
    return fallback;
  }

  return normalized;
};
