import { existsSync } from "node:fs";
import { getViteConfigPath } from "../common/src/project/paths.js";

export const scopedViteConfigPath = (scope?: string) => {
  let viteConfigPath = getViteConfigPath(scope).getAbsolutePath();
  if (scope && !existsSync(viteConfigPath)) {
    viteConfigPath = getViteConfigPath().getAbsolutePath();
  }

  if (existsSync(viteConfigPath)) {
    return viteConfigPath;
  }
};
