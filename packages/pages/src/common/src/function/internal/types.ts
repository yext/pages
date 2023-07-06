import { FunctionModule, FunctionTypes } from "../types.js";
import { validateFunctionModule } from "./validateFunctionModule.js";
import { PluginEvent } from "../../ci/ci.js";

/**
 * A domain representation of a serverless function module. Contains all fields from an imported
 * module as well as metadata about the module used in downstream processing.
 */
export interface FunctionModuleInternal {
  /** The filepath to the serverless function file. */
  filePath: FunctionFilePath;
  /** The exported config function. */
  config: FunctionConfigInternal;
  /** The exported function. */
  default?: FunctionTypes;
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
 * Stores the filepath to a function.
 */
export interface FunctionFilePath {
  /**
   * The absolute path from the user's root directory.
   * Ex. /Users/example/Desktop/mySite/src/functions/http/getInfo.ts
   */
  absolute: string;
  /** The path from src/functions. Ex. http/getInfo */
  relative: string;
  /** The file extension. Ex: ts */
  extension: string;
  /** The file name. Ex: getInfo */
  filename: string;
}

/**
 * Converts user-provided function information to an internal module.
 * @param functionFilepath the filepath information for the function
 * @param functionModule the public function module to convert
 */
export const convertFunctionModuleToFunctionModuleInternal = (
  functionFilepath: FunctionFilePath,
  functionModule: FunctionModule
): FunctionModuleInternal => {
  let functionInternal;

  const functionType = functionFilepath.relative.split("/")[0];

  if (
    (functionType === "onUrlChange" || functionType === "onPageGenerate") &&
    functionFilepath.relative.split("/").length > 2 &&
    !functionFilepath.absolute.includes("dist")
  ) {
    throw new Error(`Cannot load ${functionFilepath.relative}.\n Nested directories are not 
    supported for onUrlChange and onPageGenerate plugins. All functions must be located at the 
    root of src/functions/onUrlChange or src/functions/onPageGenerate.`);
  }

  if (
    functionType === "http" ||
    functionType === "onUrlChange" ||
    functionType === "onPageGenerate"
  ) {
    validateFunctionModule(functionFilepath.absolute, functionModule);

    const defaultSlug = functionFilepath.relative.replace(
      `${functionType}/`,
      ""
    );

    functionInternal = {
      default: functionModule.default,
      config: {
        name:
          functionFilepath.filename.replaceAll("[", "").replaceAll("]", "") +
          "-" +
          unsecureHashName(functionFilepath.relative),
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
      `Cannot load ${functionFilepath.relative}.\nAll Serverless Functions should live in src/functions/http, src/functions/onPageGenerate, or src/functions/onUrlChange.`
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
    case "onPageGenerate":
      return "ON_PAGE_GENERATE";
    default:
      throw new Error(`No matching PluginEvent found for: ${event}`);
  }
};

/**
 * Hashes a string into a five-digit number. Used to de-duplicate function names.
 * Source: {@link https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type}
 * @param input The value to hash.
 * @returns A five-character string of the hash.
 */
const unsecureHashName = (input: string): string => {
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
