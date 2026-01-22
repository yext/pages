import fs from "node:fs";
import path from "node:path";

export const isUsingConfig = (configName: string, scope: string | undefined): boolean => {
  if (scope) {
    return fs.existsSync(path.resolve(scope, configName));
  }
  return fs.existsSync(configName);
};
