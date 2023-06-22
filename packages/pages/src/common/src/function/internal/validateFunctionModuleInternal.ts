import { FunctionConfigInternal, FunctionModuleInternal } from "./types.js";
import { FunctionModule, FunctionConfig } from "../types.js";

export const validateFunctionDefaultExport = (
  filepath: string,
  serverlessFunction: FunctionModule
) => {
  if (!serverlessFunction.default) {
    throw new Error(`${filepath} is missing an default export function.`);
  }
};

export const validateFunctionModuleInternal = (
  serverlessFunction: FunctionModuleInternal
) => {
  validateConfigInternal(
    serverlessFunction.filename,
    serverlessFunction.config
  );

  if (!serverlessFunction.getPath) {
    throw new Error(
      `Function ${serverlessFunction.filename} is missing an exported getPath function.`
    );
  }
};

export const validateConfigInternal = (
  filename: string,
  serverlessFunctionConfigInternal: FunctionConfigInternal
) => {
  if (!serverlessFunctionConfigInternal.name) {
    throw new Error(
      `Function ${filename} is missing a "name" in the config function.`
    );
  }

  if (!serverlessFunctionConfigInternal.functionName) {
    throw new Error(
      `Function ${filename} is missing a "functionName" in the config function.`
    );
  }
};

export const validateFunctionModule = (
  filepath: string,
  serverlessFunction: FunctionModule
) => {
  if (!serverlessFunction.config) {
    throw new Error(`${filepath} is missing an exported config function.`);
  } else {
    validateConfig(filepath, serverlessFunction.config);
  }

  if (!serverlessFunction.getPath) {
    throw new Error(`${filepath} is missing an exported getPath function.`);
  }

  validateFunctionDefaultExport(filepath, serverlessFunction);
};

export const validateConfig = (
  filename: string,
  serverlessFunctionConfig: FunctionConfig
) => {
  if (!serverlessFunctionConfig.name) {
    throw new Error(`${filename} is missing a "name" in the config function.`);
  }

  if (!serverlessFunctionConfig.functionName) {
    throw new Error(
      `${filename} is missing a "functionName" in the config function.`
    );
  }
};
