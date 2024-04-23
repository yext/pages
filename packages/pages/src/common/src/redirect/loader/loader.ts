import {
  convertRedirectModuleToRedirectModuleInternal,
  RedirectModuleInternal,
} from "../internal/types.js";
import { ProjectStructure } from "../../project/structure.js";
import { loadModules } from "../../loader/vite.js";

/**
 * Loads all redirects in the project.
 *
 * @param redirectModulePaths the redirect filepaths to load as modules
 * @param transpile set to true if the redirects need to be transpiled (such as when they are in tsx format)
 * @param adjustForFingerprintedAsset removes the fingerprint portion (for server bundles)
 * @param projectStructure the structure of the project
 * @returns Promise<{@link RedirectModuleCollection}>
 */
export const loadRedirectModules = async (
  redirectModulePaths: string[],
  transpile: boolean,
  adjustForFingerprintedAsset: boolean,
  projectStructure: ProjectStructure
): Promise<RedirectModuleCollection> => {
  const importedModules = await loadModules(
    redirectModulePaths,
    transpile,
    projectStructure
  );

  const importedRedirectModules = [] as RedirectModuleInternal<any>[];
  for (const importedModule of importedModules) {
    const redirectModuleInternal =
      convertRedirectModuleToRedirectModuleInternal(
        importedModule.path,
        importedModule.module,
        adjustForFingerprintedAsset
      );

    importedRedirectModules.push({
      ...redirectModuleInternal,
      path: importedModule.path,
    });
  }

  return importedRedirectModules.reduce((prev, module) => {
    if (prev.has(module.config.name)) {
      throw new Error(
        `Redirects must have unique names. Found multiple redirects with name "${module.config.name}"`
      );
    }
    return prev.set(module.config.name, module);
  }, new Map());
};

// A RedirectModuleCollection is a collection of redirect modules indexed by feature name.
export type RedirectModuleCollection = Map<string, RedirectModuleInternal<any>>;
