import { existsSync } from "node:fs";
import path from "node:path";

const VITE_CONFIG = "vite.config.js";

export const scopedViteConfigPath = (scope?: string) => {
  if (scope) {
    const scopedViteConfigPath = path.resolve(scope, VITE_CONFIG);
    if (existsSync(scopedViteConfigPath)) {
      return scopedViteConfigPath;
    }
  }

  const viteConfigPath = path.resolve(VITE_CONFIG);
  if (existsSync(viteConfigPath)) {
    return viteConfigPath;
  }
};

export const removePluginFromViteConfig = (config: any) => {
  if (config?.plugins?.[0]) {
    config.plugins = config.plugins?.[0]?.filter(
      (obj: any) =>
        obj.name !== "vite:react-refresh" || obj.name !== "vite:react-babel"
    );
  }
  return config;
};
