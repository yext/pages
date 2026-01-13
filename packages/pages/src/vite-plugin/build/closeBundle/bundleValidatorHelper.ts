import { globSync } from "glob";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import path from "path";

// Helper functions extracted from bundleValidator.ts for testing purposes.

export const getBundlePaths = (projectStructure: ProjectStructure): string[] => {
  const { rootFolders, subfolders } = projectStructure.config;

  return globSync(
    convertToPosixPath(
      `${path.resolve(rootFolders.dist, subfolders.assets)}/{${
        subfolders.renderBundle
      },${subfolders.renderer},${subfolders.serverBundle},${subfolders.static}}/**/*.*`
    )
  );
};

export { statSync } from "fs";
