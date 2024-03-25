import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../internal/types.js";
import { ProjectStructure } from "../../project/structure.js";
import { loadModules } from "../../loader/vite.js";
import { ViteDevServer } from "vite";
import { loadViteModule } from "../../../../dev/server/ssr/loadViteModule.js";
import { TemplateModule } from "../types.js";

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
  adjustForFingerprintedAsset: boolean,
  projectStructure: ProjectStructure
): Promise<TemplateModuleCollection> => {
  const importedModules = await loadModules(
    templateModulePaths,
    transpile,
    projectStructure
  );

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

/**
 * Simlar to loadTemplateModules above but reuses and existing Vite dev server.
 */
export const loadTemplateModuleCollectionUsingVite = async (
  vite: ViteDevServer,
  templateFilepaths: string[]
): Promise<TemplateModuleCollection> => {
  const templateModules: TemplateModuleInternal<any, any>[] = await Promise.all(
    templateFilepaths.map(async (templateFilepath) => {
      const templateModule = await loadViteModule<TemplateModule<any, any>>(
        vite,
        templateFilepath
      );
      return convertTemplateModuleToTemplateModuleInternal(
        templateFilepath,
        templateModule,
        false
      );
    })
  );
  return templateModules.reduce((prev, module) => {
    return prev.set(module.config.name, module);
  }, new Map());
};
