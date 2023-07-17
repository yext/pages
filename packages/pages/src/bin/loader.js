// A custom loader to append .js to react-dom/server
//
// In my quest to support both React 17 and 18 I ran into a very annoying blocker related to
// not being able to use the .js extension when importing ReactDOMServer from “react-dom/server”.
// For React 17 using Node 17, you need to use the .js extension OR you can set
// --experimental-specifier-resolution=node which we had in PagesJS awhile back.
// Unfortunately for React 18, you cannot use the .js extension at all because the file is not exported.
// It results in this error:
// Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './server.js' is not defined by "exports" in
// /path/to/node_modules/react-dom/package.json
//
// React should really export this file as it's the correct solution to use with Node without
// experimental flags. Once that happens the .js can be added back to the react-dom/server usages.
// https://github.com/facebook/react/issues/26170
export function resolve(specifier, context, nextResolve) {
  if (specifier === "react-dom/server") {
    return nextResolve(specifier + ".node");
  }
  return nextResolve(specifier);
}
