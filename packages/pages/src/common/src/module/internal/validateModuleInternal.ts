import { ModuleInternal } from "./types.js";

export const validateModuleInternal = (module: ModuleInternal) => {
  if (!module.default) {
    throw new Error(`Module ${module.filename} must have a React component as a default export.`);
  }
};
