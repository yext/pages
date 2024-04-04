import { ViteDevServer } from "vite";
import {
  getAllLocalData,
  readLocalDataFile,
  staticPageCriterion,
} from "./getLocalData.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import { propsLoader } from "./propsLoader.js";
import { loadTemplateModuleInternal } from "./findTemplateModuleInternal.js";

export type StaticTemplateAndProps = {
  staticTemplateModuleInternal: TemplateModuleInternal<any, any>;
  props: TemplateRenderProps;
};

type TemplateAndLocalDataPaths = {
  templateFilePath?: string;
  localDataFilename?: string;
  isStatic: boolean;
};

// A cache of slug to template/localData filepaths to avoid loading everything on every lookup.
const slugToModuleAndLocalDataPaths = new Map<
  string,
  TemplateAndLocalDataPaths
>();

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
  useProdUrls: boolean,
  slug: string, // treated as templateName when useProdUrls is true
  locale?: string
): Promise<StaticTemplateAndProps | void> => {
  // If locale is passed it's being used in noProdUrl mode so treat slug as templateName and
  // locale as part of the slug key.
  const resolvedSlug = useProdUrls ? slug : `${slug}/${locale}`;

  const moduleAndDocPaths = slugToModuleAndLocalDataPaths.get(resolvedSlug);
  if (moduleAndDocPaths) {
    // If we've seen this slug and determined it's not for a static template return early
    if (!moduleAndDocPaths.isStatic) {
      return;
    }

    // Freshly load the template and document as they could have changed
    const templateModuleInternal = await loadTemplateModuleInternal(
      devserver,
      moduleAndDocPaths.templateFilePath!
    );

    const document = await readLocalDataFile(
      moduleAndDocPaths.localDataFilename!
    );

    const props: TemplateRenderProps = await propsLoader({
      templateModuleInternal,
      document: document,
    });

    // Use the result of getPath for prodUrls, otherwise use templateName
    if (useProdUrls) {
      if (templateModuleInternal.getPath(props) === slug) {
        return {
          staticTemplateModuleInternal: templateModuleInternal,
          props: props,
        };
      }
    } else {
      if (templateModuleInternal.config.name === slug) {
        return {
          staticTemplateModuleInternal: templateModuleInternal,
          props: props,
        };
      }
    }
  }

  // Cache miss, find the info for the slug
  for (const templateFilepath of templateFilepaths) {
    const templateModuleInternal = await loadTemplateModuleInternal(
      devserver,
      templateFilepath
    );

    if (templateModuleInternal.config.templateType !== "static") {
      continue;
    }

    const localDatas = await getAllLocalData(
      staticPageCriterion(templateModuleInternal.config.name, locale)
    );

    for (const localData of localDatas) {
      const props: TemplateRenderProps = await propsLoader({
        templateModuleInternal,
        document: localData.document,
      });

      slugToModuleAndLocalDataPaths.set(resolvedSlug, {
        templateFilePath: templateFilepath,
        localDataFilename: localData.localDataFilename,
        isStatic: true,
      });

      // Use the result of getPath for prodUrls, otherwise use templateName
      if (useProdUrls) {
        if (templateModuleInternal.getPath(props) === slug) {
          return {
            staticTemplateModuleInternal: templateModuleInternal,
            props: props,
          };
        }
      } else {
        if (templateModuleInternal.config.name === slug) {
          return {
            staticTemplateModuleInternal: templateModuleInternal,
            props: props,
          };
        }
      }
    }
  }

  // No static templates/files found for this slug, cache it as non-static
  slugToModuleAndLocalDataPaths.set(resolvedSlug, {
    isStatic: false,
  });
};
