import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";

// Determines the template module to load from a given feature name (from the exported config)
export const findTemplateModuleInternal = async (
  devserver: ViteDevServer,
  criterion: (t: TemplateModuleInternal<any, any>) => boolean,
  templateFilepaths: string[]
): Promise<TemplateModuleInternal<any, any> | null> => {
  for (const templateFilepath of templateFilepaths) {
    const templateModule = await loadTemplateModule(
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
