import { TEMPLATE_PATH } from "./constants.js";
import { readdir } from "fs/promises";
import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import { TemplateModule } from "../../../../../common/src/template/types.js";

// Determines the template module to load from a given feature name (from the exported config)
export const featureNameToTemplateModule = async (
  devserver: ViteDevServer,
  feature: string
): Promise<TemplateModule<any> | null> => {
  const directoryFilenames = await readdir(`./${TEMPLATE_PATH}`);

  for (const fileName of directoryFilenames) {
    const templateModule = await loadTemplateModule(
      devserver,
      fileName,
      `${TEMPLATE_PATH}/${fileName}`
    );

    if (!templateModule?.config?.name) {
      continue;
    }

    const templateName = templateModule.config.name;
    if (feature === normalizeTemplateName(templateName)) {
      return templateModule;
    }
  }

  return null;
};

const normalizeTemplateName = (name: string) => {
  return name.replace(/\s/g, "").toLowerCase();
};
