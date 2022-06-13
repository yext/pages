import { TEMPLATE_PATH } from "./constants.js";
import { readdir } from "fs/promises";
import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import { TemplateModule } from "../../../../../common/src/template/types.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../../../common/src/template/internal/types.js";

// Determines the template module to load from a given feature name (from the exported config)
export const featureNameToTemplateModuleInternal = async (
  devserver: ViteDevServer,
  featureName: string
): Promise<TemplateModuleInternal<any> | null> => {
  const directoryFilenames = await readdir(`./${TEMPLATE_PATH}`);

  for (const filename of directoryFilenames) {
    const templateFilepath = `${TEMPLATE_PATH}/${filename}`;
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

    if (
      featureName === normalizeTemplateName(templateModuleInternal.config.name)
    ) {
      return templateModuleInternal;
    }
  }

  return null;
};

const normalizeTemplateName = (name: string) => {
  return name.replace(/\s/g, "").toLowerCase();
};
