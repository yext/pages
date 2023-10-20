import fs from "node:fs";

export const isUsingConfig = (): boolean => {
  return fs.existsSync("config.yaml");
};
