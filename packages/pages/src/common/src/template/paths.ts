import path from "node:path";

const winSep = "\\";

/**
 * Function that takes a path to a generated template and returns the
 * relative path to the root of the site. Will return the empty string
 * if already at the root level.
 *
 * @public
 */
export const getRelativePrefixToRootFromPath = (path: string): string => {
  const pathComponents = path.split("/");
  pathComponents.pop();

  return pathComponents
    .map(() => "../")
    .reduce((previousValue, currentValue) => previousValue + currentValue, "");
};

/**
 * Converts any path to a posix path delimited by "/". Useful for ensuring that a path will be dynamically importable as only posix-style
 * paths are supported with import.
 */
export const convertToPosixPath = (p: string) => {
  return p.split(winSep).join(path.posix.sep);
};

/**
 * Convert any path to match the format of the OS. If it already matches no change occurs.
 */
export const convertToOSPath = (p: string) => {
  return p.split(path.posix.sep).join(path.sep).split(winSep).join(path.sep);
};
