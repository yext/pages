import glob from "glob";
import { Path } from "../../project/path.js";
import { FunctionFilePath } from "./types.js";

/**
 * Get all the functions files in a directory
 * @param root the directory to check for functions
 * @returns a list of function filepaths
 */
export const getFunctionFilepaths = (root: string): FunctionFilePath[] => {
  const functionsRoot = new Path(root);
  const filepaths = glob.sync(
    `${functionsRoot.getAbsolutePath()}/**/*.{tsx,jsx,js,ts}`
  );

  return filepaths.map((filepath) => {
    const filePathMatcher = filepath.match(`${root}(.*)\\.`);
    if (!filePathMatcher || filePathMatcher.length < 2) {
      throw new Error(
        `Cannot resolve relative path from ${root} for ${filepath}`
      );
    }
    return {
      absolute: filepath,
      relative: filePathMatcher[1] ?? "",
      extension: filepath.split(".").pop() ?? "",
    };
  }) as FunctionFilePath[];
};
