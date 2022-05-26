import { TemplateModule } from "../../../common/src/template/types";

/**
 * Imports modules from the server bundle paths and validates that they are of the expected form.
 * If they are not valid then an error is thrown.
 *
 * @throws when a module in the serverBundlePaths is invalid
 * @returns A mapping for feature name to template module
 */
export const loadTemplateModules = async (
  serverBundlePaths: string[]
): Promise<TemplateModuleCollection> => {
  const importedModules = [] as TemplateModule<any>[];
  for (const p of serverBundlePaths) {
    let mod = {} as TemplateModule<any>;
    try {
      mod = await import(p);
    } catch (e) {
      throw new Error(`Could not import ${p} ${e}`);
    }

    if (!mod.config) {
      throw new Error(`Template at "${p}" does not export a config$`);
    }
    importedModules.push({ ...mod, path: p });
  }

  validateModules(importedModules);
  return importedModules.reduce(
    (prev, mod) => prev.set(mod.config.name, mod),
    new Map()
  );
};

const validateModules = (templateModules: TemplateModule<any>[]) => {
  validateUniqueFeatureName(templateModules);
};

/**
 * Checks that a feature name doesn't appear twice in the set of template modules.
 * @param templateModules
 */
const validateUniqueFeatureName = (templateModules: TemplateModule<any>[]) => {
  const featureNames = new Set<string>();
  templateModules
    .map((module) => module.config.name)
    .forEach((featureName) => {
      if (featureNames.has(featureName)) {
        throw new Error(
          `Templates must have unique feature names. Found multiple modules with "${featureName}"`
        );
      }
      featureNames.add(featureName);
    });
};

// A TemplateModule which also exports a Page component used for hydration.
export interface HydrationTemplateModule extends TemplateModule<any> {
  Page: any;
}

// A TemplateModuleCollection is a collection of template modules indexed by feature name.
export type TemplateModuleCollection = Map<string, TemplateModule<any>>;
