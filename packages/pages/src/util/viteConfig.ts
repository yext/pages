import { existsSync } from "node:fs";
import { getViteConfigPath } from "../common/src/project/paths.js";

export const scopedViteConfigPath = (scope?: string) => {
  const viteConfigPath = getViteConfigPath(scope, { fallbackToRoot: true }).getAbsolutePath();
  if (existsSync(viteConfigPath)) {
    return viteConfigPath;
  }
};
