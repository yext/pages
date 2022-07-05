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

  let relativePrefixToRoot = "";
  pathComponents.forEach((_) => (relativePrefixToRoot += "../"));

  return relativePrefixToRoot;
};
