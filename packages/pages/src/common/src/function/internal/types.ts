import { ServerlessFunction, FunctionModule } from "../types.js";
import {
  validateFunctionDefaultExport,
  validateFunctionModule,
} from "./validateFunctionModule.js";
import { PluginEvent } from "../../ci/ci.js";

/**
 * A domain representation of a serverless function module. Contains all fields from an imported
 * module as well as metadata about the module used in downstream processing.
 */
export interface FunctionModuleInternal {
  /** The filepath to the serverless function file. */
  filePath: FunctionFilePath;
  /** The exported config function */
  config: FunctionConfigInternal;
  /** The exported getPath function */
  getPath?: () => string;
  /** The exported function */
  default?: ServerlessFunction;
  /** The slug to host the function at */
  slug: string;
}

/**
 * The exported `config` function's definition.
 */
export interface FunctionConfigInternal {
  /** The given name of the serverless function. */
  name: string;
  /** The http event. */
  event: PluginEvent;
  /** The default export's name */
  functionName: string;
}

/**
 * Stores the filepath to a function
 */
export interface FunctionFilePath {
  /** The absolute path from the user's root directory */
  absolute: string;
  /** The path from src/functions */
  relative: string;
  /** The file extensions */
  extension: string;
}

/**
 * Converts user-provided function information to an internal module
 * @param functionFilepath the filepath information for the function
 * @param functionModule the public function module to convert
 */
export const convertFunctionModuleToFunctionModuleInternal = (
  functionFilepath: FunctionFilePath,
  functionModule: FunctionModule
): FunctionModuleInternal => {
  let functionInternal;

  if (
    functionFilepath.relative.slice(0, 5) === "/http" &&
    Object.keys(functionModule).length === 1
  ) {
    validateFunctionDefaultExport(functionFilepath.absolute, functionModule);

    const defaultSlug = functionFilepath.relative.replace("/http/", "");

    functionInternal = {
      ...functionModule,
      config: {
        name: defaultSlug,
        functionName: "default",
        event: "API" as PluginEvent,
      },
      filePath: functionFilepath,
      slug: defaultSlug,
      getPath: () => defaultSlug,
    };
  } else {
    validateFunctionModule(functionFilepath.absolute, functionModule);

    functionInternal = {
      ...functionModule,
      config: {
        name: functionModule.config?.name ?? functionFilepath.relative,
        functionName: "default",
        event: "API" as PluginEvent,
      },
      filePath: functionFilepath,
      slug: functionModule.getPath ? functionModule.getPath() : "",
    };
  }

  return functionInternal;
};
