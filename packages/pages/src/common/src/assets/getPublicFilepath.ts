import { pathToFileURL } from "url";
import { UserConfig } from "vite";
import { import_ } from "./import.js";

/**
 * Determines the public directory to use
 * @param defaultPublicDir the default directory for public
 * @param viteConfigPath the path to vite.config.js
 */
export const determinePublicFilepath = async (
  defaultPublicDir: string,
  viteConfigPath: string
): Promise<string> => {
  const viteConfig = await import_(pathToFileURL(viteConfigPath).toString());
  const userConfig = viteConfig.default as UserConfig;

  return userConfig.publicDir || defaultPublicDir;
};
