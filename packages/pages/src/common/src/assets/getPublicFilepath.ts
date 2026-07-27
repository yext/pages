import { UserConfig } from "vite";
import { import_, versionedFileUrl } from "./import.js";

/**
 * Determines the public directory to use
 * @param defaultPublicDir the default directory for public
 * @param viteConfigPath the path to vite.config.js
 */
export const determinePublicFilepath = async (
  defaultPublicDir: string,
  viteConfigPath: string
): Promise<string> => {
  if (viteConfigPath === "") {
    return defaultPublicDir;
  }

  const viteConfig = await import_(await versionedFileUrl(viteConfigPath));
  const userConfig = viteConfig.default as UserConfig;

  return userConfig.publicDir || defaultPublicDir;
};
