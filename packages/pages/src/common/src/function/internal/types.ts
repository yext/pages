import path from "path";
import { FunctionModule, FunctionType } from "../types.js";
import { validateFunctionModule } from "./validateFunctionModule.js";
import { PluginEvent } from "../../ci/ci.js";
import { ProjectStructure } from "../../project/structure.js";

/**
 * A domain representation of a serverless function module. Contains all fields from an imported
 * module as well as metadata about the module used in downstream processing.
 */
export interface FunctionModuleInternal {
  /** The filepath to the serverless function file. */
  filePath: path.ParsedPath;
  /** The exported config function. */
  config: FunctionConfigInternal;
  /** The exported function. */
  default?: FunctionType;
  /** The slugs to host the function at. */
  slug: {
    /** The slug defined by the user. Example: api/user/[id]/profile */
    original: string;
    /** Used for the production build. Example: api/user/{{id}}/profile */
    production: string;
    /** Used for the dev server. Example: api/user/:id/profile */
    dev: string;
  };
}

/**
 * The exported `config` function's definition.
 */
export interface FunctionConfigInternal {
  /** The given name of the serverless function. */
  name: string;
  /** The http event. */
  event: PluginEvent;
  /** The default export's name. */
  functionName: string;
}

/**
 * Converts user-provided function information to an internal module.
 * @param functionFilepath the filepath information for the function
 * @param functionModule the public function module to convert
 */
export const convertFunctionModuleToFunctionModuleInternal = (
  functionFilepath: path.ParsedPath,
  functionModule: FunctionModule,
  projectStructure: ProjectStructure
): FunctionModuleInternal => {
  const serverlessSourcePath =
    projectStructure.config.rootFolders.source +
    "/" + // purposefully using string concatentation and not path.join
    projectStructure.config.subfolders.serverlessFunctions;
  const serverlessDistPath =
    projectStructure.config.rootFolders.dist +
    "/" + // purposefully using string concatentation and not path.join
    projectStructure.config.subfolders.serverlessFunctions;

  let functionInternal;
  let functionsRoot;
  if (path.format(functionFilepath).includes(serverlessSourcePath)) {
    functionsRoot = serverlessSourcePath; // local dev server
  } else if (path.format(functionFilepath).includes(serverlessDistPath)) {
    functionsRoot = serverlessDistPath; // production build
  } else if (
    path.format(functionFilepath).includes("tests/fixtures/src/functions")
  ) {
    functionsRoot = "tests/fixtures/src/functions"; // unit testing
  }

  const relativePath = path
    .format(functionFilepath)
    .split(`/${serverlessSourcePath}/`)[1];
  const functionType = relativePath.split("/")[0];

  if (
    functionType === "onUrlChange" &&
    relativePath.split("/").length > 2 &&
    functionsRoot !== serverlessDistPath
  ) {
    throw new Error(`Cannot load ${path.format(
      functionFilepath
    )}.\n Nested directories are not supported for onUrlChange plugins. 
    All functions must be located at the root of src/functions/onUrlChange.`);
  }

  if (functionType === "http" || functionType === "onUrlChange") {
    validateFunctionModule(functionFilepath.dir, functionModule);

    const defaultSlug = relativePath
      .replace(`${functionType}/`, "")
      .split(".")
      .slice(0, -1)
      .join(".");

    functionInternal = {
      default: functionModule.default,
      config: {
        name:
          functionFilepath.name.replaceAll("[", "").replaceAll("]", "") +
          "-" +
          unsecureHashPluginName(relativePath),
        functionName: "default",
        event: convertToPluginEvent(functionType),
      },
      filePath: functionFilepath,
      slug: {
        original: defaultSlug,
        dev: defaultSlug.replaceAll("[", ":").replaceAll("]", ""),
        production: defaultSlug.replaceAll("[", "{{").replaceAll("]", "}}"),
      },
    };
  } else {
    throw new Error(
      `Cannot load ${path.format(
        functionFilepath
      )}.\nAll Serverless Functions should live in src/functions/http or src/functions/onUrlChange.`
    );
  }

  return functionInternal;
};

export const convertToPluginEvent = (event: string): PluginEvent => {
  switch (event) {
    case "http":
      return "API";
    case "onUrlChange":
      return "ON_URL_CHANGE";
    default:
      throw new Error(`No matching PluginEvent found for: ${event}`);
  }
};

/**
 * Hashes a string into a five-digit number. Used to de-duplicate function names.
 * Source: {@link https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type}
 * @param input The value to hash. (For plugins, everything after src/functions/)
 * @returns A five-character string of the hash.
 */
export const unsecureHashPluginName = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (Math.abs(hash) % 100000).toLocaleString("en-US", {
    minimumIntegerDigits: 5,
    useGrouping: false,
  });
};
