import { existsSync } from "node:fs";
import { getViteConfigPath } from "../common/src/project/paths.js";

export const scopedViteConfigPath = (scope?: string) => {
  if (scope) {
    const scopedViteConfigPath = getViteConfigPath(scope).getAbsolutePath();
    if (existsSync(scopedViteConfigPath)) {
      return scopedViteConfigPath;
    }
  }

  const viteConfigPath = getViteConfigPath().getAbsolutePath();
  if (existsSync(viteConfigPath)) {
    return viteConfigPath;
  }
};
