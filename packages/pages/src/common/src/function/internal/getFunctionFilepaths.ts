import glob from "glob";
import { Path } from "../../project/path.js";
import { FunctionFilePath } from "./types.js";

/**
 * Get all the functions files in a directory
 * @param root the directory to check for functions (src/functions or dist/functions)
 * @returns a list of function filepaths
 */
export const getFunctionFilepaths = (root: string): FunctionFilePath[] => {
  const functionsRoot = new Path(root); // resolve the functions root
  // Get all js/ts files in the directory or subdirectories
  const filepaths = glob.sync(
    `${functionsRoot.getAbsolutePath()}/**/*.{tsx,jsx,js,ts}`
  );

  return filepaths.map((filepath) => {
    // This RegExp captures anything after the functions root and before the file extension
    const filePathMatcher = filepath.match(`${root}(.*)\\.`);
    if (!filePathMatcher || filePathMatcher.length < 2) {
      // the matcher should be able to find a relative path
      // with [0] being the absolute path and [1] being the relative path
      throw new Error(
        `Cannot resolve relative path from ${root} for ${filepath}`
      );
    }

    return {
      // absolute: /Users/example/Desktop/mySite/src/functions/http/getInfo.ts
      absolute: filepath,
      // relative: http/getInfo (get the relative path from the RegExp and remove the leading "/")
      relative: filePathMatcher[1].slice(1) ?? "",
      // extension: ts (divide the absolute path by "." and get the last value)
      extension: filepath.split(".").pop() ?? "",
      // filename: getInfo
      // (Divide the absolute path by "/" and get the last value [just the file name].
      // Then, divide again by "." and get all except the last value [no extension].)
      filename: filepath
        .split("/")
        .slice(-1)[0]
        .split(".")
        .slice(0, -1)
        .join("."),
    } as FunctionFilePath;
  });
};
