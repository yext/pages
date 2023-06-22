import {
  ServerlessFunction,
  FunctionConfig,
  FunctionModule,
} from "../types.js";
import { parse } from "../../template/internal/types.js";
import {
  validateFunctionDefaultExport,
  validateFunctionModule,
  validateFunctionModuleInternal,
} from "./validateFunctionModuleInternal.js";
import { PluginEvent } from "../../ci/ci.js";

/**
 * A domain representation of a serverless function module. Contains all fields from an imported
 * module as well as metadata about the module used in downstream processing.
 */
export interface FunctionModuleInternal {
  /**
   * The filepath to the serverless function file.
   */
  path: string;
  /** The name of the file (with extension) */
  filename: string;
  /** The name of the file (without extension) */
  functionName: string;
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
  /** The name of the serverless function feature. */
  name: string;
  /** The http event. */
  event: PluginEvent;
  /** The function's name */
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
        functionName: functionPath.name,
        event: "API" as PluginEvent,
      },
      path: functionFilepath,
      filename: functionPath.base,
      functionName: functionPath.name,
      slug: defaultPath,
      getPath: () => defaultPath,
      default: functionModule.default,
    };
  } else {
    validateFunctionModule(functionFilepath, functionModule);

    functionInternal = {
      ...functionModule,
      config: convertFunctionConfigToFunctionConfigInternal(
        functionPath.name,
        functionModule.config
      ),
      path: functionFilepath,
      filename: functionPath.base,
      functionName: functionPath.name,
      slug: functionModule.getPath ? functionModule.getPath() : "",
    };
  }

  validateFunctionModuleInternal(functionInternal);

  return functionInternal;
};

const convertFunctionConfigToFunctionConfigInternal = (
  functionName: string,
  functionConfig: FunctionConfig | undefined
): FunctionConfigInternal => {
  return {
    name: functionConfig?.name ?? functionName,
    event: functionConfig?.event ?? "API",
    functionName: functionConfig?.functionName ?? functionName,
    ...functionConfig,
  };
};
