import { TEMPLATE_PATH } from "./constants.js";
import { readdir } from "fs/promises";
import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import { TemplateModule } from "../../../../../common/src/template/types.js";

// Determines the template module to load from a given feature name (from the exported config)
export const featureNameToTemplateModule = async (
  devserver: ViteDevServer,
  featureName: string
): Promise<TemplateModule<any> | null> => {
  const directoryFilenames = await readdir(`./${TEMPLATE_PATH}`);

  for (const filename of directoryFilenames) {
    const templateModule = await loadTemplateModule(
      devserver,
      filename,
      `${TEMPLATE_PATH}/${filename}`
    );

    const resolvedFeatureName =
      templateModule?.config?.name || templateModule.templateName;

    if (featureName === normalizeTemplateName(resolvedFeatureName)) {
      return templateModule;
    }
  }

  return null;
};

const normalizeTemplateName = (name: string) => {
  return name.replace(/\s/g, "").toLowerCase();
};
