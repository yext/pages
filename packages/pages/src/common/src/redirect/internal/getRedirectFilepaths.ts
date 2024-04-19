import path from "node:path";
import { Path } from "../../project/path.js";
import { ProjectStructure } from "../../project/structure.js";
import { convertToPosixPath } from "../../template/paths.js";
import { globSync } from "glob";

/**
 * Get all the redirect files in the provided redirect folder path(s).
 *
 * If there are files that share the same name between the provided
 * redirect folder paths, only the file found in the first visited path
 * from the list is included.
 *
 * @param paths a list of paths to collect redirect files from
 * @returns a list of redirect filepaths
 */
export const getRedirectFilePaths = (paths: Path[]): string[] => {
  const redirectFilepaths: string[] = [];
  const addedFilenames: Set<string> = new Set();
  paths.forEach((p) => {
    const filepaths = globSync(
      convertToPosixPath(`${p.getAbsolutePath()}/*.{tsx,jsx,js,ts}`)
    );
    filepaths.forEach((f) => {
      const fileName = path.basename(f);
      if (!addedFilenames.has(fileName)) {
        addedFilenames.add(fileName);
        redirectFilepaths.push(f);
      }
    });
  });

  return redirectFilepaths;
};

export const getRedirectFilePathsFromProjectStructure = (
  projectStructure: ProjectStructure
): string[] => {
  return getRedirectFilePaths(projectStructure.getRedirectPaths());
};
