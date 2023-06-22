import {
  ExecuteServerlessFunction,
  ServerlessFunctionArgument,
  ServerlessFunctionConfig,
  ServerlessFunctionModule,
} from "../types.js";
import { GetPath } from "../../template/types.js";
import { parse } from "../../template/internal/types.js";
import {
  validateServerlessFunctionModule,
  validateServerlessFunctionModuleInternal,
} from "./validateServerlessFunctionModuleInternal.js";
import { PluginEvent } from "../../ci/ci.js";

/**
 * A domain representation of a serverless function module. Contains all fields from an imported
 * module as well as metadata about the module used in downstream processing.
 */
export interface ServerlessFunctionModuleInternal<
  U extends ServerlessFunctionArgument
> {
  /**
   * The filepath to the serverless function file.
   */
  path: string;
  /** The name of the file (with extension) */
  filename: string;
  /** The name of the file (without extension) */
  functionName: string;
  /** The exported config function */
  config: ServerlessFunctionConfigInternal;
  /** The exported getPath function */
  getPath: GetPath<void>;
  /** The exported function */
  default?: ExecuteServerlessFunction<U>;
  /** The slug to host the function at */
  slug: string;
}

/**
 * The exported `config` function's definition.
 */
export interface ServerlessFunctionConfigInternal {
  /** The name of the serverless function feature. */
  name: string;
  /** The http event. */
  event?: PluginEvent;
  /** The function's name */
  functionName: string;
}

export const convertServerlessFunctionModuleToServerlessFunctionModuleInternal =
  (
    serverlessFunctionFilepath: string,
    serverlessFunctionModule: ServerlessFunctionModule<any>,
    adjustForFingerprintedAsset: boolean
  ): ServerlessFunctionModuleInternal<any> => {
    const serverlessFunctionPath = parse(
      serverlessFunctionFilepath,
      adjustForFingerprintedAsset
    );

    let serverlessFunctionInternal;

    if (
      serverlessFunctionFilepath.includes("/functions/http") &&
      Object.keys(serverlessFunctionModule).length === 1
    ) {
      const defaultPath = serverlessFunctionFilepath
        .split("/functions/http/")[1]
        .split(".")
        .slice(-2)[0];
      serverlessFunctionInternal = {
        ...serverlessFunctionModule,
        config: {
          name: defaultPath,
          functionName: serverlessFunctionPath.name,
        },
        path: serverlessFunctionFilepath,
        filename: serverlessFunctionPath.base,
        functionName: serverlessFunctionPath.name,
        slug: defaultPath,
        getPath: () => defaultPath,
      };
    } else {
      validateServerlessFunctionModule(
        serverlessFunctionFilepath,
        serverlessFunctionModule
      );

      serverlessFunctionInternal = {
        ...serverlessFunctionModule,
        config:
          convertServerlessFunctionConfigToServerlessFunctionConfigInternal(
            serverlessFunctionPath.name,
            serverlessFunctionModule.config
          ),
        path: serverlessFunctionFilepath,
        filename: serverlessFunctionPath.base,
        functionName: serverlessFunctionPath.name,
        slug: serverlessFunctionModule.getPath(),
      };
    }

    validateServerlessFunctionModuleInternal(serverlessFunctionInternal);

    return serverlessFunctionInternal;
  };

const convertServerlessFunctionConfigToServerlessFunctionConfigInternal = (
  serverlessFunctionName: string,
  serverlessFunctionConfig: ServerlessFunctionConfig | undefined
): ServerlessFunctionConfigInternal => {
  return {
    name: serverlessFunctionConfig?.name ?? serverlessFunctionName,
    functionName:
      serverlessFunctionConfig?.functionName ?? serverlessFunctionName,
    ...serverlessFunctionConfig,
  };
};
