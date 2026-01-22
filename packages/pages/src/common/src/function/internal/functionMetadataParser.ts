import { ProjectStructure } from "../../project/structure.js";
import path from "node:path";
import { convertToPosixPath } from "../../template/paths.js";

// type functionType = typeof validFunctionTypes[number];
const validFunctionTypes = ["onUrlChange", "http"];

export interface FunctionMetadata {
  filepath: string;
  name: string;
  slug: {
    original: string;
    dev: string;
    production: string;
  };
  functionType: string;
}

/**
 * Determines the metadata of a function based on its pathing structure.
 *
 * @public
 */
export class FunctionMetadataParser {
  functionMetadata: FunctionMetadata;

  constructor(absolutePathToFunction: string, projectStructure: ProjectStructure) {
    const { rootFolders, subfolders } = projectStructure.config;

    const sourcePath = path.join(rootFolders.source, subfolders.serverlessFunctions);

    const distPath = path.join(rootFolders.dist, subfolders.serverlessFunctions);

    const testsPath = path.join("tests", "fixtures", "src", "functions");

    // The path after /src/functions
    const relativePath = absolutePathToFunction.split(`${path.sep}${sourcePath}${path.sep}`)[1];

    // Should be onUrlChange or http
    const functionType = relativePath.split(path.sep)[0];
    if (!validFunctionTypes.find((ft) => ft === functionType)) {
      throw new Error(
        `Cannot load ${absolutePathToFunction}.\n` +
          `All Serverless Functions should live in src/functions/http or src/functions/onUrlChange.`
      );
    }

    let functionsRoot;
    if (absolutePathToFunction.includes(sourcePath)) {
      functionsRoot = sourcePath; // local dev server
    } else if (absolutePathToFunction.includes(distPath)) {
      functionsRoot = distPath; // production build
    } else if (absolutePathToFunction.includes(testsPath)) {
      functionsRoot = testsPath; // unit testing
    }

    if (
      functionType === "onUrlChange" &&
      relativePath.split(path.sep).length > 2 &&
      functionsRoot !== distPath
    ) {
      throw new Error(
        `Cannot load ${absolutePathToFunction}.\n` +
          `Nested directories are not supported for onUrlChange plugins. ` +
          `All functions must be located at the root of src/functions/onUrlChange.`
      );
    }

    // Slug is defined by the path and filename
    const defaultSlug = relativePath
      .replace(`${functionType}${path.sep}`, "")
      .split(".")
      .slice(0, -1)
      .join(".");
    const devSlug = defaultSlug.replaceAll("[", ":").replaceAll("]", "");
    const prodSlug = defaultSlug.replaceAll("[", "{{").replaceAll("]", "}}");

    const name =
      path.parse(absolutePathToFunction).name.replaceAll("[", "").replaceAll("]", "") +
      "-" +
      unsecureHashPluginName(relativePath);

    this.functionMetadata = {
      filepath: absolutePathToFunction,
      name: name,
      slug: {
        original: defaultSlug,
        dev: devSlug,
        production: prodSlug,
      },
      functionType: functionType,
    };
  }
}

/**
 * Hashes a string into a five-digit number. Used to de-duplicate function names.
 * Source: {@link https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type}
 * @param input The value to hash. (For plugins, everything after src/functions/)
 * @returns A five-character string of the hash.
 */
const unsecureHashPluginName = (input: string): string => {
  const posixPath = convertToPosixPath(input);
  let hash = 0;
  for (let i = 0; i < posixPath.length; i++) {
    const code = posixPath.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (Math.abs(hash) % 100000).toLocaleString("en-US", {
    minimumIntegerDigits: 5,
    useGrouping: false,
  });
};
