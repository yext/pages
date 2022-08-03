import { statSync } from "fs";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";
import { TemplateModule } from "../../../common/src/template/types.js";

const PLUGIN_FILESIZE_LIMIT = 1.5; // MB
const PLUGIN_TOTAL_FILESIZE_LIMIT = 10; // MB

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
  const importedModules = [] as TemplateModuleInternal<any, any>[];
  for (const p of serverBundlePaths) {
    let templateModule = {} as TemplateModule<any, any>;
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
  validateBundles(serverBundlePaths);
  return importedModules.reduce(
    (prev, module) => prev.set(module.config.name, module),
    new Map()
  );
};

const validateModules = (
  templateModules: TemplateModuleInternal<any, any>[]
) => {
  validateUniqueFeatureName(templateModules);
};

/**
 * Checks that a feature name doesn't appear twice in the set of template modules.
 * @param templateModules
 */
const validateUniqueFeatureName = (
  templateModules: TemplateModuleInternal<any, any>[]
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

const validateBundles = (
  serverBundlePaths: string[]
) => {
  let sizeOfAllBundles = 0;
  serverBundlePaths.forEach(serverBundlePath => {
    sizeOfAllBundles += validateFilesize(serverBundlePath);
  });
  validateTotalSourceSize(sizeOfAllBundles);
};

/**
 * Verifies that the bundled file does not exceed the filesize limit of the Yext Plugins system.
 */
const validateFilesize = (serverBundlePath: string): number => {
  const stats = statSync(serverBundlePath);
  if (stats.size / (1024*1024) > PLUGIN_FILESIZE_LIMIT) {
    throw new Error(`Bundled file ${serverBundlePath} exceeds max size of ${PLUGIN_FILESIZE_LIMIT} MB`);
  }

  return stats.size;
}

/**
 * Verifies that the total size across all bundled files does not exceed the total cap
 * of the Yext Plugins system.
 */
const validateTotalSourceSize = (totalSizeInBytes: number) => {
  if (totalSizeInBytes / (1024*1024) > PLUGIN_TOTAL_FILESIZE_LIMIT) {
    throw new Error(`The total size of all bundles exceeds the max size of ${PLUGIN_TOTAL_FILESIZE_LIMIT} MB`)
  }
}

// A TemplateModule which also exports a Page component used for hydration.
export interface HydrationTemplateModule
  extends TemplateModuleInternal<any, any> {
  Page: any;
}

// A TemplateModuleCollection is a collection of template modules indexed by feature name.
export type TemplateModuleCollection = Map<
  string,
  TemplateModuleInternal<any, any>
>;
