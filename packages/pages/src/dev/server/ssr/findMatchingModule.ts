import { ViteDevServer } from "vite";
import {
  convertModuleDefinitionToModuleInternal,
  ModuleInternal,
} from "../../../common/src/module/internal/types.js";
import { ModuleDefinition } from "../../../common/src/module/types.js";
import { loadViteModule } from "./loadViteModule.js";
import { getModuleFilepathsFromProjectStructure } from "../../../common/src/module/internal/getModuleFilepaths.js";
import { getModuleName } from "../../../common/src/module/internal/getModuleConfig.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { createTsMorphProject } from "../../../common/src/parsers/sourceFileParser.js";
import path from "path";
import fs from "fs";

export interface ModuleInfo {
  moduleName: string;
  modulePath: string;
  postCssPath: string | undefined;
}

export const loadModuleInternal = async (
  devserver: ViteDevServer,
  moduleFilePath: string
): Promise<ModuleInternal | null> => {
  const moduleDefinition = await loadViteModule<ModuleDefinition>(devserver, moduleFilePath);

  return convertModuleDefinitionToModuleInternal(moduleFilePath, moduleDefinition);
};

/**
 * Finds module info by searching src/modules by module.config.name then by
 * folder name. Returns info for the matching module or undefined if not
 * found.
 *
 * @param searchName
 * @param projectStructure
 * @return moduleInfo
 */
export const getModuleInfoFromModuleName = async (
  searchName: string,
  projectStructure: ProjectStructure
): Promise<ModuleInfo | undefined> => {
  const moduleFilePaths = getModuleFilepathsFromProjectStructure(projectStructure);
  const project = createTsMorphProject();
  let moduleName = "";
  let modulePath = "";
  for (const moduleFilePath of moduleFilePaths) {
    project.addSourceFileAtPath(moduleFilePath);
    const thisModuleName = getModuleName(moduleFilePath);
    if (thisModuleName?.toLowerCase() === searchName.toLowerCase()) {
      moduleName = thisModuleName;
      modulePath = moduleFilePath;
      break;
    }
  }

  // Use file path that matches given name if none match the config.name
  if (!modulePath || !moduleName) {
    for (const moduleFilePath of moduleFilePaths) {
      const folderName = moduleFilePath.split("/").slice(-2)[0];
      if (folderName.toLowerCase() === searchName.toLowerCase()) {
        project.addSourceFileAtPath(moduleFilePath);
        moduleName = getModuleName(moduleFilePath) || folderName;
        modulePath = moduleFilePath;
        break;
      }
    }
  }

  if (!modulePath || !moduleName) {
    console.error(`Could not find module for "${searchName}"`);
    return;
  }

  let postCssPath: string | undefined = path.resolve(modulePath, "../postcss.config.js");

  if (!fs.existsSync(postCssPath)) {
    postCssPath = undefined;
  }

  return {
    moduleName: moduleName,
    modulePath: modulePath,
    postCssPath: postCssPath,
  };
};
