import { ModuleInternal, ModuleConfigInternal } from "./types.js";

export const validateModuleInternal = (module: ModuleInternal) => {
  validateConfig(module.filename, module.config);

  if (!module.default) {
    throw new Error(
      `Module ${module.filename} must have a React component as a default export.`
    );
  }
};

export const validateConfig = (
  filename: string,
  moduleConfigInternal: ModuleConfigInternal
) => {
  if (!moduleConfigInternal.name) {
    throw new Error(
      `Module ${filename} is missing a "name" in the config function.`
    );
  }
};
