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

  return VITE_CONFIG;
};
