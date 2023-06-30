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
 * Stores the filepath to a function
 */
export interface FunctionFilePath {
  /** The absolute path from the user's root directory. */
  absolute: string;
  /** The path from src/functions. */
  relative: string;
  /** The file extension. */
  extension: string;
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
        name: defaultSlug,
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
      "All Serverless Functions should live in src/functions/http," +
        " src/functions/onPageGenerate, or src/functions/onUrlChange. "
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
