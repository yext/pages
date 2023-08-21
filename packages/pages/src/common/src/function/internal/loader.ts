import path from "path";
import { FunctionModule } from "../types.js";
import {
  convertFunctionModuleToFunctionModuleInternal,
  FunctionModuleInternal,
} from "./types.js";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import { pathToFileURL } from "url";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import { processEnvVariables } from "../../../../util/processEnvVariables.js";
import { ProjectStructure } from "../../project/structure.js";
import { COMMON_ESBUILD_LOADERS } from "../../loader/esbuild.js";

const TEMP_DIR = ".temp";

/**
 * Loads all functions in the project.
 *
 * @param functionPaths the function filepaths to load as modules
 * @param transpile set to true if the functions need to be transpiled (such as when they are in tsx format)
 * @returns Promise<{@link FunctionModuleCollection}>
 */
export const loadFunctionModules = async (
  functionPaths: path.ParsedPath[],
  transpile: boolean,
  projectStructure: ProjectStructure
): Promise<FunctionModuleCollection> => {
  const importedModules = [] as FunctionModuleInternal[];
  for (const functionPath of functionPaths) {
    let functionModule = {} as FunctionModule;
    try {
      if (transpile) {
        const buildResult = await esbuild.build({
          entryPoints: [path.format(functionPath)],
          outdir: TEMP_DIR,
          write: false,
          format: "esm",
          bundle: true,
          loader: COMMON_ESBUILD_LOADERS,
          define: processEnvVariables("YEXT_PUBLIC"),
        });

        functionModule = await importFromString(
          buildResult.outputFiles[0].text
        );
      } else {
        functionModule = await import(
          pathToFileURL(path.format(functionPath)).toString()
        );
      }
    } catch (e) {
      throw new Error(`Could not import ${path.format(functionPath)} ${e}`);
    }

    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        functionPath,
        functionModule,
        projectStructure
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
export const loadFunctions = async (
  root: string,
  projectStructure: ProjectStructure
) => {
  const functionFilepaths = getFunctionFilepaths(root);
  return await loadFunctionModules(functionFilepaths, true, projectStructure);
};
