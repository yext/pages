import { ViteDevServer } from "vite";
import { loadViteModule } from "./loadViteModule.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";
import { TemplateModule } from "../../../common/src/template/types.js";

// Determines the template module to load from a given feature name (from the exported config)
export const findTemplateModuleInternal = async (
  devserver: ViteDevServer,
  criterion: (t: TemplateModuleInternal<any, any>) => boolean | undefined,
  templateFilepaths: string[]
): Promise<TemplateModuleInternal<any, any> | null> => {
  for (const templateFilepath of templateFilepaths) {
    const templateModule = await loadViteModule<TemplateModule<any, any>>(
      devserver,
      templateFilepath
    );

    const templateModuleInternal =
      convertTemplateModuleToTemplateModuleInternal(
        templateFilepath,
        templateModule,
        false
      );

    if (criterion(templateModuleInternal)) {
      return templateModuleInternal;
    }
  }

  return null;
};
