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
  const importedModules = [] as TemplateModule[];
  for (const p of serverBundlePaths) {
    let mod = {} as TemplateModule;
    try {
      mod = await import(p);
    } catch (e) {
      throw new Error(`Could not import ${p} ${e}`);
    }

    if (!mod.config) {
      throw new Error(`Template at "${p}" does not export a config$`);
    }
    importedModules.push({ ...mod, serverPath: p });
  }

  validateModules(importedModules);
  return importedModules.reduce(
    (prev, mod) => prev.set(mod.config.name, mod),
    new Map()
  );
};

const validateModules = (templateModules: TemplateModule[]) => {
  validateUniqueFeatureName(templateModules);
};

/**
 * Checks that a feature name doesn't appear twice in the set of template modules.
 * @param templateModules
 */
const validateUniqueFeatureName = (templateModules: TemplateModule[]) => {
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

// A domain representation of a template module. Contains all fields from an imported module as well
// as metadata about the module used in downstream processing.
export interface TemplateModule {
  // The path to the server bundle this module was imported from
  serverPath: string;
  config: {
    name: string;
    stream: any;
    streamId?: string;
  };
  getPath: any;
  render: any;
}

// A TemplateModule which also exports a Page component used for hydration.
export interface HydrationTemplateModule extends TemplateModule {
  Page: any;
}

// A TemplateModuleCollection is a collection of template modules indexed by feature name.
export type TemplateModuleCollection = Map<string, TemplateModule>;
