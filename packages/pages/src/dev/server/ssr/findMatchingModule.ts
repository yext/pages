import { ViteDevServer } from "vite";
import {
  convertModuleToModuleInternal,
  ModuleInternal,
} from "../../../common/src/module/internal/types.js";
import { ModuleDefinition } from "../../../common/src/module/types.js";
import { loadViteModule } from "./loadViteModule.js";
import { getModuleFilepathsFromProjectStructure } from "../../../common/src/module/internal/getModuleFilepaths.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import SourceFileParser, {
  createTsMorphProject,
} from "../../../common/src/parsers/sourceFileParser.js";
import path from "path";
import fs from "fs";

// Determines the module to load from a given module name (from the exported config)
export const findModuleInternal = async (
  devserver: ViteDevServer,
  criterion: (t: ModuleInternal) => Promise<boolean | undefined>,
  moduleFilePaths: string[]
): Promise<ModuleInternal | null> => {
  for (const moduleFilepath of moduleFilePaths) {
    const moduleModule = await loadViteModule<ModuleDefinition>(
      devserver,
      moduleFilepath
    );

    const moduleInternal = convertModuleToModuleInternal(
      moduleFilepath,
      moduleModule
    );

    if (await criterion(moduleInternal)) {
      return moduleInternal;
    }
  }

  return null;
};

export const getPostCssPathFromModuleName = async (
  moduleName: string | undefined,
  projectStructure: ProjectStructure
): Promise<string | undefined> => {
  if (moduleName == undefined) {
    return "";
  }
  const moduleFilePaths =
    getModuleFilepathsFromProjectStructure(projectStructure);
  const project = createTsMorphProject();
  let targetModuleFilePath = "";
  for (const moduleFilePath of moduleFilePaths) {
    project.addSourceFileAtPath(moduleFilePath);
    const sourceFile = project.getSourceFile(moduleFilePath);
    if (sourceFile !== undefined) {
      const parser = new SourceFileParser(moduleFilePath, project);
      const thisModuleName = parser.getVariablePropertyByName("config", "name");
      if (thisModuleName.toLowerCase() === moduleName) {
        targetModuleFilePath = moduleFilePath;
        break;
      }
    }
  }

  // Use file path that matches given name if none match the config.name, if possible
  if (targetModuleFilePath == "") {
    for (const moduleFilePath of moduleFilePaths) {
      const folderName = moduleFilePath.split("/").slice(-2)[0].toLowerCase();
      if (folderName === moduleName.toLowerCase()) {
        targetModuleFilePath = moduleFilePath;
        break;
      }
    }
  }

  if (targetModuleFilePath == "") {
    console.error(`Could not find module matching ${moduleName}`);
    return;
  }

  const postCssPath = path.resolve(
    targetModuleFilePath,
    "../postcss.config.js"
  );

  if (fs.existsSync(postCssPath)) {
    return postCssPath;
  }
};
