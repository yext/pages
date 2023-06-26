import glob from "glob";
import path from "path";
import { Path } from "../../project/path.js";

/**
 * Get all the functions files in the provided function folder path(s).
 *
 * If there are files that share the same name between the provided
 * function folder paths, only the file found in the first visited path
 * from the list is included.
 *
 * @param paths a list of paths to collect serverless function files from
 * @returns a list of function filepaths
 */
export const getFunctionFilepaths = (paths: Path[]): string[] => {
  const functionFilepaths: string[] = [];
  const addedFilenames: Set<string> = new Set();
  paths.forEach((p) => {
    const filepaths = glob.sync(`${p.getAbsolutePath()}/**/*.{tsx,jsx,js,ts}`);
    filepaths.forEach((f) => {
      const fileName = path.basename(f);
      if (!addedFilenames.has(fileName)) {
        addedFilenames.add(fileName);
        functionFilepaths.push(f);
      }
    });
  });

  return functionFilepaths;
};
