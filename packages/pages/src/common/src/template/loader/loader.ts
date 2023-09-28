import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../internal/types.js";
import { loadModules } from "../../loader/esbuild.js";

/**
 * Loads all templates in the project.
 *
 * @param templateModulePaths the templates filepaths to load as modules
 * @param transpile set to true if the templates need to be transpiled (such as when they are in tsx format)
 * @param adjustForFingerprintedAsset removes the fingerprint portion (for server bundles)
 * @returns Promise<{@link TemplateModuleCollection}>
 */
export const loadTemplateModules = async (
  templateModulePaths: string[],
  transpile: boolean,
  adjustForFingerprintedAsset: boolean
): Promise<TemplateModuleCollection> => {
  const importedModules = await loadModules(templateModulePaths, transpile);

  const importedTemplateModules = [] as TemplateModuleInternal<any, any>[];
  for (const importedModule of importedModules) {
    const templateModuleInternal =
      convertTemplateModuleToTemplateModuleInternal(
        importedModule.path,
        importedModule.module,
        adjustForFingerprintedAsset
      );

    importedTemplateModules.push({
      ...templateModuleInternal,
      path: importedModule.path,
    });
  }

  return importedTemplateModules.reduce((prev, module) => {
    if (prev.has(module.config.name)) {
      throw new Error(
        `Templates must have unique feature names. Found multiple modules with "${module.config.name}"`
      );
    }
    return prev.set(module.config.name, module);
  }, new Map());
};

// A TemplateModuleCollection is a collection of template modules indexed by feature name.
export type TemplateModuleCollection = Map<
  string,
  TemplateModuleInternal<any, any>
>;
