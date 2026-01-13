import { FunctionModule } from "../types.js";

export const validateFunctionModule = (filepath: string, serverlessFunction: FunctionModule) => {
  if (!serverlessFunction.default) {
    throw new Error(`${filepath} is missing a default export.`);
  }
};
