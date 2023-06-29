import { FunctionModule } from "../types.js";
import {
  convertFunctionModuleToFunctionModuleInternal,
  FunctionFilePath,
  FunctionModuleInternal,
} from "./types.js";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import { pathToFileURL } from "url";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import { processEnvVariables } from "../../../../util/processEnvVariables.js";

const TEMP_DIR = ".temp";

/**
 * Loads all functions in the project.
 *
 * @param functionPaths the function filepaths to load as modules
 * @param transpile set to true if the functions need to be transpiled (such as when they are in tsx format)
 * @returns Promise<{@link FunctionModuleCollection}>
 */
export const loadFunctionModules = async (
  functionPaths: FunctionFilePath[],
  transpile: boolean
): Promise<FunctionModuleCollection> => {
  const importedModules = [] as FunctionModuleInternal[];
  for (const functionPath of functionPaths) {
    let functionModule = {} as FunctionModule;
    try {
      if (transpile) {
        const buildResult = await esbuild.build({
          entryPoints: [functionPath.absolute],
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
        functionModule = await import(
          pathToFileURL(functionPath.absolute).toString()
        );
      }
    } catch (e) {
      throw new Error(`Could not import ${functionPath} ${e}`);
    }

    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        functionPath,
        functionModule
      );

    importedModules.push({
      ...functionModuleInternal,
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
    return prev.set(module.config.name, module);
  }, new Map());
};

/**
 * A FunctionModuleCollection maps function name to internal function modules
 */
export type FunctionModuleCollection = Map<string, FunctionModuleInternal>;

/**
 * Loads all functions by finding all files under the provided root and then creating
 * FunctionModules for each
 * @param root the directory to check for functions
 * @return Promise<FunctionModuleCollection>
 */
export const loadFunctions = async (root: string) => {
  const functionFilepaths = getFunctionFilepaths(root);
  return await loadFunctionModules(functionFilepaths, true);
};
