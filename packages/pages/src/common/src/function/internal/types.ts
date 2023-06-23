import { ServerlessFunction, FunctionModule } from "../types.js";
import { parse } from "../../template/internal/types.js";
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
  path: string;
  /** The name of the file (with extension) */
  filename: string;
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

export const convertFunctionModuleToFunctionModuleInternal = (
  functionFilepath: string,
  functionModule: FunctionModule,
  adjustForFingerprintedAsset: boolean
): FunctionModuleInternal => {
  const functionPath = parse(functionFilepath, adjustForFingerprintedAsset);
  let functionInternal;

  if (
    functionFilepath.includes("/functions/http") &&
    Object.keys(functionModule).length === 1
  ) {
    validateFunctionDefaultExport(functionFilepath, functionModule);

    const defaultPath = functionFilepath
      .split("/functions/http/")[1]
      .split(".")
      .slice(-2)[0];

    functionInternal = {
      ...functionModule,
      config: {
        name: defaultPath,
        functionName: functionModule.default?.name ?? functionPath.name,
        event: "API" as PluginEvent,
      },
      path: functionFilepath,
      filename: functionPath.base,
      slug: defaultPath,
      getPath: () => defaultPath,
    };
  } else {
    validateFunctionModule(functionFilepath, functionModule);

    functionInternal = {
      ...functionModule,
      config: {
        name: functionModule.config?.name ?? functionPath.name,
        functionName: functionModule.default?.name ?? functionPath.name,
        event: "API" as PluginEvent,
      },
      path: functionFilepath,
      filename: functionPath.base,
      slug: functionModule.getPath ? functionModule.getPath() : "",
    };
  }

  return functionInternal;
};
