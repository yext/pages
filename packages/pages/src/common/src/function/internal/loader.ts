import path from "node:path";
import { convertFunctionModuleToFunctionModuleInternal, FunctionModuleInternal } from "./types.js";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import { ProjectStructure } from "../../project/structure.js";
import { loadModules } from "../../loader/vite.js";

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
  const functionPathStrings = functionPaths.map((functionPath) => path.format(functionPath));

  const importedModules = await loadModules(functionPathStrings, transpile, projectStructure);

  const importedFunctionModules = [] as FunctionModuleInternal[];
  for (const importedModule of importedModules) {
    const functionModuleInternal = convertFunctionModuleToFunctionModuleInternal(
      path.parse(importedModule.path),
      importedModule.module,
      projectStructure
    );

    importedFunctionModules.push({
      ...functionModuleInternal,
    });
  }

  return importedFunctionModules.reduce((prev, module) => {
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
export const loadFunctions = async (root: string, projectStructure: ProjectStructure) => {
  const functionFilepaths = getFunctionFilepaths(root);
  return await loadFunctionModules(functionFilepaths, true, projectStructure);
};
