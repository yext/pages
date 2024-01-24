import { ViteDevServer } from "vite";
import {
  getAllLocalData,
  getLocalData,
  staticPageCriterion,
} from "./getLocalData.js";
import {
  TemplateModuleInternal,
  convertTemplateModuleToTemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";
import { loadViteModule } from "./loadViteModule.js";
import {
  TemplateModule,
  TemplateRenderProps,
} from "../../../common/src/template/types.js";
import { propsLoader } from "./propsLoader.js";
import { findTemplateModuleInternal } from "./findTemplateModuleInternal.js";

export type StaticTemplateAndProps = {
  staticTemplateModuleInternal: TemplateModuleInternal<any, any>;
  props: TemplateRenderProps;
};

/**
 * Loops through all static templates. For each, finds all localData static files
 * matching the template's config.name, applies getPath with the template and document,
 * and checks if the getPath value matches the slug we're looking for. If found,
 * both the templateModuleInternal for the static template as well as the corresponding
 * transformed props are returned (so we don't need to find the document again). If no slugs
 * match then return undefined so that entity templates can be checked.
 *
 * This is to facilitate dynamic mode for static templates where locale is not a
 * query param.
 */
export const findStaticTemplateModuleAndDocBySlug = async (
  devserver: ViteDevServer,
  templateFilepaths: string[],
  slug: string
): Promise<StaticTemplateAndProps | void> => {
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

    if (templateModuleInternal.config.templateType !== "static") {
      continue;
    }

    // need to revamp for non-dynamic
    const docs = await getAllLocalData(
      staticPageCriterion(templateModuleInternal.config.name)
    );

    for (const doc of docs) {
      const props: TemplateRenderProps = await propsLoader({
        templateModuleInternal,
        document: doc,
      });

      if (templateModuleInternal.getPath(props) === slug) {
        return {
          staticTemplateModuleInternal: templateModuleInternal,
          props: props,
        };
      }
    }
  }
};

/**
 * Find the static template based on templateName (which comes from the local
 * url) as well as the corresponding localData document. If neither is found
 * returns undefined.
 */
export const findStaticTemplateModuleAndDocByTemplateName = async (
  devserver: ViteDevServer,
  templateFilepaths: string[],
  featureName: string,
  locale: string
): Promise<StaticTemplateAndProps | void> => {
  const templateModuleInternal = await findTemplateModuleInternal(
    devserver,
    async (t) =>
      t.config.templateType === "static" && featureName === t.config.name,
    templateFilepaths
  );
  if (!templateModuleInternal) {
    return;
  }

  const document = await getLocalData(staticPageCriterion(featureName, locale));
  if (!document) {
    return;
  }

  const props: TemplateRenderProps = await propsLoader({
    templateModuleInternal,
    document,
  });

  return {
    staticTemplateModuleInternal: templateModuleInternal,
    props: props,
  };
};
