import { ModuleConfig, Module, ModuleDefinition } from "../types.js";
import { parse } from "../../template/internal/types.js";
import { validateModuleInternal } from "./validateModuleInternal.js";
import { lookup } from "mime-types";

/**
 * A domain representation of a template module. Contains all fields from an imported module as well
 * as metadata about the module used in downstream processing.
 */
export interface ModuleInternal {
  /**
   * The filepath to the module file. This can be the raw TSX file when used during dev mode or
   * the path to the server bundle this module was imported from during prod build.
   */
  path: string;
  /** The name of the file (with extension) */
  filename: string;
  /** The name of the file (without extension) */
  moduleName: string;
  /** The exported config function */
  config: ModuleConfigInternal;
  /** The exported default module function */
  default: Module;
}

/**
 * The exported `config` function's definition.
 */
export interface ModuleConfigInternal {
  /** The name of the module feature. If not defined uses the module filename (without extension) */
  name: string;
}

export const convertModuleToModuleInternal = (
  moduleFilepath: string,
  module: ModuleDefinition
): ModuleInternal => {
  const modulePath = parse(moduleFilepath, false);

  const config = convertModuleConfigToModuleConfigInternal(
    modulePath.name,
    module.config
  );

  const moduleInternal = {
    ...module,
    config: config,
    path: moduleFilepath,
    filename: modulePath.base,
    moduleName: config.name,
  } as ModuleInternal;

  validateModuleInternal(moduleInternal);
  return moduleInternal;
};

export const convertModuleConfigToModuleConfigInternal = (
  moduleName: string,
  moduleConfig: ModuleConfig | undefined
): ModuleConfigInternal => {
  return {
    name: moduleConfig?.name ?? moduleName,
  };
};

export const getContentType = (moduleInternal: ModuleInternal): string => {
  return lookup(moduleInternal.path) || "text/html";
};
