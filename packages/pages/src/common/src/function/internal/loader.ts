import { FunctionModule } from "../types.js";
import {
  convertFunctionModuleToFunctionModuleInternal,
  FunctionModuleInternal,
} from "./types.js";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import { pathToFileURL } from "url";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import { Path } from "../../project/path.js";
import { defaultProjectStructureConfig } from "../../project/structure.js";
import { processEnvVariables } from "../../../../util/processEnvVariables.js";

const TEMP_DIR = ".temp";

/**
 * Loads all functions in the project.
 *
 * @param functionPaths the function filepaths to load as modules
 * @param transpile set to true if the functions need to be transpiled (such as when they are in tsx format)
 * @param adjustForFingerprintedAsset removes the fingerprint portion (for server bundles)
 * @returns Promise<{@link FunctionModuleCollection}>
 */
export const loadFunctionModules = async (
  functionPaths: string[],
  transpile: boolean,
  adjustForFingerprintedAsset: boolean
): Promise<FunctionModuleCollection> => {
  const importedModules = [] as FunctionModuleInternal[];
  for (const functionPath of functionPaths) {
    let functionModule = {} as FunctionModule;
    try {
      if (transpile) {
        const buildResult = await esbuild.build({
          entryPoints: [functionPath],
          outdir: TEMP_DIR,
          write: false,
          format: "esm",
          bundle: true,
          loader: {
            ".ico": "dataurl",
          },
          define: processEnvVariables("YEXT_PUBLIC"),
        });

        functionModule = await importFromString(
          buildResult.outputFiles[0].text
        );
      } else {
        functionModule = await import(pathToFileURL(functionPath).toString());
      }
    } catch (e) {
      throw new Error(`Could not import ${functionPath} ${e}`);
    }

    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        functionPath,
        functionModule,
        adjustForFingerprintedAsset
      );

    importedModules.push({
      ...functionModuleInternal,
      path: functionPath,
    });
  }

  return importedModules.reduce((prev, module) => {
    if (prev.has(module.config.name)) {
      throw new Error(
        `Functions must have unique feature names. Found multiple modules with "${module.config.name}"`
      );
    }
    if (prev.has(module.slug)) {
      throw new Error(
        `Functions must have unique slugs. Found multiple modules with "${module.slug}"`
      );
    }
    return prev.set(module.slug, module);
  }, new Map());
};

/**
 * A FunctionModuleCollection is a collection of function modules
 * indexed by feature name.
 */
export type FunctionModuleCollection = Map<string, FunctionModuleInternal>;

/**
 * Loads all functions by finding all files under /src/functions and then creating
 * FunctionModules for each
 * @return Promise<FunctionModuleCollection>
 */
export const loadFunctions = async () => {
  const functionFilepaths = getFunctionFilepaths([
    new Path(defaultProjectStructureConfig.filepathsConfig.functionsRoot),
  ]);
  return await loadFunctionModules(functionFilepaths, true, false);
};
