import {
  ServerlessFunctionConfigInternal,
  ServerlessFunctionModuleInternal,
} from "./types.js";
import {
  ServerlessFunctionModule,
  ServerlessFunctionConfig,
} from "../types.js";

export const validateServerlessFunctionDefaultExport = (
  filepath: string,
  serverlessFunction: ServerlessFunctionModule<any>
) => {
  if (!serverlessFunction.default) {
    throw new Error(`${filepath} is missing an default export function.`);
  }
};

export const validateServerlessFunctionModuleInternal = (
  serverlessFunction: ServerlessFunctionModuleInternal<any>
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
  serverlessFunctionConfigInternal: ServerlessFunctionConfigInternal
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

export const validateServerlessFunctionModule = (
  filepath: string,
  serverlessFunction: ServerlessFunctionModule<any>
) => {
  if (!serverlessFunction.config) {
    throw new Error(`${filepath} is missing an exported config function.`);
  } else {
    validateConfig(filepath, serverlessFunction.config);
  }

  if (!serverlessFunction.getPath) {
    throw new Error(`${filepath} is missing an exported getPath function.`);
  }

  validateServerlessFunctionDefaultExport(filepath, serverlessFunction);
};

export const validateConfig = (
  filename: string,
  serverlessFunctionConfig: ServerlessFunctionConfig
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
