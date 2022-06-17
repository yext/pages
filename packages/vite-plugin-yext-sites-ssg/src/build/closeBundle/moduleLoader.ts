import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../../common/src/template/internal/types.js";
import { TemplateModule } from "../../../../common/src/template/types.js";

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
  const importedModules = [] as TemplateModuleInternal<any>[];
  for (const p of serverBundlePaths) {
    let templateModule = {} as TemplateModule<any>;
    try {
      templateModule = await import(p);
    } catch (e) {
      throw new Error(`Could not import ${p} ${e}`);
    }

    const templateModuleInternal =
      convertTemplateModuleToTemplateModuleInternal(p, templateModule, true);

    importedModules.push({ ...templateModuleInternal, path: p });
  }

  validateModules(importedModules);
  return importedModules.reduce(
    (prev, module) => prev.set(module.config.name, module),
    new Map()
  );
};

const validateModules = (templateModules: TemplateModuleInternal<any>[]) => {
  validateUniqueFeatureName(templateModules);
};

/**
 * Checks that a feature name doesn't appear twice in the set of template modules.
 * @param templateModules
 */
const validateUniqueFeatureName = (
  templateModules: TemplateModuleInternal<any>[]
) => {
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
export interface HydrationTemplateModule extends TemplateModuleInternal<any> {
  Page: any;
}

// A TemplateModuleCollection is a collection of template modules indexed by feature name.
export type TemplateModuleCollection = Map<string, TemplateModuleInternal<any>>;
