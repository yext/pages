import { globSync } from "glob";
import path from "path";
import { Path } from "../../project/path.js";
import { convertToPosixPath } from "../../template/paths.js";

/**
 * Get all the functions files in a directory
 * @param root the directory to check for functions (src/functions or dist/functions)
 * @returns a list of function filepaths
 */
export const getFunctionFilepaths = (root: string): path.ParsedPath[] => {
  const functionsRoot = new Path(root); // resolve the functions root
  // Get all js/ts files in the directory or subdirectories
  const filepaths = globSync(
    convertToPosixPath(
      `${functionsRoot.getAbsolutePath()}/**/*.{tsx,jsx,js,ts}`
    )
  );

  return filepaths.map((filepath) => {
    return path.parse(path.resolve(filepath));
  });
};
