import { FunctionModule, FunctionConfig } from "../types.js";

export const validateFunctionDefaultExport = (
  filepath: string,
  serverlessFunction: FunctionModule
) => {
  if (!serverlessFunction.default) {
    throw new Error(`${filepath} is missing a default export.`);
  }
};

export const validateConfig = (
  filepath: string,
  functionConfig: FunctionConfig
) => {
  if (!functionConfig.name) {
    throw new Error(`${filepath} is missing "name" in the config function.`);
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
