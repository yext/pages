import { ViteDevServer } from "vite";
import { loadViteModule } from "./loadViteModule.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";
import { TemplateModule } from "../../../common/src/template/types.js";

// A cache of templateName to its filepath. This is an optimization to avoid trying
// to iterate through all templates on each request. If a templateName changes it is
// required to restart the dev server.
const templateNameToTemplateFilepath = new Map<string, string>();

// Determines the template module to load from a given templateName. The module is
// reloaded upon cache hit to ensure up-to-date data.
export const findTemplateModuleInternalByName = async (
  devserver: ViteDevServer,
  templateName: string,
  templateFilepaths: string[],
  isInPlatformPageSet: boolean = false
): Promise<TemplateModuleInternal<any, any> | null> => {
  const templateFilepath = templateNameToTemplateFilepath.get(templateName);
  if (templateFilepath) {
    return await loadTemplateModuleInternal(devserver, templateFilepath);
  }

  // Load all templates into the cache until we find the one we're looking for.
  // We could load all templates but it's a slight optimization to stop once we
  // find the one we need.
  for (const templateFilepath of templateFilepaths) {
    const templateModuleInternal = await loadTemplateModuleInternal(
      devserver,
      templateFilepath
    );

    if (
      !isInPlatformPageSet &&
      templateModuleInternal.config.templateType !== "entity"
    ) {
      continue;
    }

    templateNameToTemplateFilepath.set(
      templateModuleInternal.config.name,
      templateFilepath
    );

    if (templateName === templateModuleInternal.config.name) {
      return templateModuleInternal;
    }
  }

  return null;
};

export const loadTemplateModuleInternal = async (
  devserver: ViteDevServer,
  templateFilepath: string
) => {
  // Freshly load the template as it could have changed
  const templateModule = await loadViteModule<TemplateModule<any, any>>(
    devserver,
    templateFilepath
  );

  return convertTemplateModuleToTemplateModuleInternal(
    templateFilepath,
    templateModule,
    false
  );
};
