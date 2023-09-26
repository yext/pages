import { ProjectStructure } from "../common/src/project/structure.js";
import fs from "fs";
import path from "path";

/**
 * cleans up all config files under sites-config except for redirects.csv
 * @param projectStructure
 */
export const cleanConfigs = async (projectStructure: ProjectStructure) => {
  const sitesConfigPath = projectStructure
    .getSitesConfigPath()
    .getAbsolutePath();
  fs.readdir(sitesConfigPath, (err, files: string[]) => {
    if (err) {
      console.error("error occurred while cleaning old config files: " + err);
      return;
    }

    for (const file of files) {
      if (!file.includes("redirects.csv")) {
        console.log("deleting: " + file);
        fs.rmSync(path.resolve(sitesConfigPath, file), {
          recursive: true,
          force: true,
        });
      }
    }
  });
};
