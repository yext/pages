import { ViteDevServer } from "vite";
import {
  convertModuleToModuleInternal,
  ModuleInternal,
} from "../../../common/src/module/internal/types.js";
import { ModuleModule } from "../../../common/src/module/types.js";
import { loadViteModule } from "./loadViteModule.js";

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
