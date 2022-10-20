import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";
import { getTemplatesFilepath } from "../../../common/src/template/internal/getTemplatesFilepath.js";
import { Path } from "../../../common/src/project/path.js";

// Determines the template module to load from a given feature name (from the exported config)
export const featureNameToTemplateModuleInternal = async (
  devserver: ViteDevServer,
  featureName: string,
  templatesRoot: Path,
  templatesDomain?: Path
): Promise<TemplateModuleInternal<any, any> | null> => {
  const templatesFilepath = getTemplatesFilepath(
    templatesRoot,
    templatesDomain
  );
  for (const templateFilepath of templatesFilepath) {
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

    if (featureName === templateModuleInternal.config.name) {
      return templateModuleInternal;
    }
  }

  return null;
};
