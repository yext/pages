import { TEMPLATE_PATH } from "./constants.js";
import { readdir } from "fs/promises";
import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import { TemplateModule } from "../../../../../common/templateModule/types.js";

// Determines the template module to load from a given feature name (from the exported config)
export const featureNameToTemplateModule = async (
  devserver: ViteDevServer,
  feature: string
): Promise<TemplateModule<any> | null> => {
  const dir = await readdir(`./${TEMPLATE_PATH}`);

  for (const fileName of dir) {
    const templateModule = await loadTemplateModule(devserver, fileName);

    if (
      feature === templateModule.config?.name?.replace(/\s/g, "").toLowerCase()
    ) {
      return templateModule;
    }
  }

  return null;
};
