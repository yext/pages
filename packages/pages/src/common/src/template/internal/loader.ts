import { TemplateModule } from "../types.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "./types.js";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import { pathToFileURL } from "url";

const TEMP_DIR = ".temp";

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
  const importedModules = [] as TemplateModuleInternal<any, any>[];
  for (const templateModulePath of templateModulePaths) {
    let templateModule = {} as TemplateModule<any, any>;
    try {
      if (transpile) {
        const buildResult = await esbuild.build({
          entryPoints: [templateModulePath],
          outdir: TEMP_DIR,
          write: false,
          format: "esm",
          bundle: true,
        });

        templateModule = await importFromString(
          buildResult.outputFiles[0].text
        );
      } else {
        templateModule = await import(
          pathToFileURL(templateModulePath).toString()
        );
      }
    } catch (e) {
      throw new Error(`Could not import ${templateModulePath} ${e}`);
    }

    const templateModuleInternal =
      convertTemplateModuleToTemplateModuleInternal(
        templateModulePath,
        templateModule,
        adjustForFingerprintedAsset
      );

    importedModules.push({
      ...templateModuleInternal,
      path: templateModulePath,
    });
  }

  return importedModules.reduce((prev, module) => {
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
