import { ViteDevServer } from "vite";
import {
  convertModuleToModuleInternal,
  ModuleInternal,
} from "../../../common/src/module/internal/types.js";
import { ModuleModule } from "../../../common/src/module/types.js";
import { loadViteModule } from "./loadViteModule.js";
import { getModuleFilepathsFromProjectStructure } from "../../../common/src/module/internal/getModuleFilepaths.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { createTsMorphProject } from "../../../common/src/parsers/sourceFileParser.js";
import path from "path";
import fs from "fs";

// Determines the module to load from a given feature name (from the exported config)
export const findModuleInternal = async (
  devserver: ViteDevServer,
  criterion: (t: ModuleInternal) => Promise<boolean | undefined>,
  moduleFilePaths: string[]
): Promise<ModuleInternal | null> => {
  for (const moduleFilepath of moduleFilePaths) {
    const moduleModule = await loadViteModule<ModuleModule>(
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

export const loadModuleInternalFromFilepath = async (
  devserver: ViteDevServer,
  moduleFilePath: string
): Promise<ModuleInternal> => {
  const moduleModule = await loadViteModule<ModuleModule>(
    devserver,
    moduleFilePath
  );

  return convertModuleToModuleInternal(moduleFilePath, moduleModule);
};

export const getPostCssPathFromModuleName = async (
  moduleName: string | undefined,
  projectStructure: ProjectStructure
): Promise<string> => {
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
      const exportedDeclarations = sourceFile.getExportedDeclarations();
      for (const [name, declarations] of exportedDeclarations) {
        if (name == "config") {
          declarations.forEach((declaration) => {
            for (const child of declaration.getChildren()) {
              const text = child.getText();
              if (text.includes("name:")) {
                const parsedName = text
                  .substring(
                    text.indexOf('"') + 1,
                    text.indexOf('"', text.indexOf('"') + 1)
                  )
                  .toLowerCase();
                if (parsedName == moduleName.toLowerCase()) {
                  targetModuleFilePath = moduleFilePath;
                  break;
                }
              }
            }
          });
        }
      }
    }
  }

  // Use file path that matches given name if none match the config.name, if possible
  if (targetModuleFilePath == "") {
    for (const moduleFilePath of moduleFilePaths) {
      const fileName = moduleFilePath.split("/").slice(-1)[0];
      if (
        fileName.substring(0, fileName.indexOf(".")).toLowerCase() ==
        moduleName.toLowerCase()
      ) {
        targetModuleFilePath = moduleFilePath;
        break;
      }
    }
  }

  if (targetModuleFilePath == "") {
    console.error(`Could not find module matching ${moduleName}`);
    return "";
  }

  const postCssPath = path.resolve(
    targetModuleFilePath,
    "../postcss.config.js"
  );

  if (fs.existsSync(postCssPath)) {
    return postCssPath;
  }
  console.log(`No postcss.config.js file found for module ${moduleName}`);
  return "";
};
