import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import merge from "lodash/merge.js";
import { propsLoader } from "../ssr/propsLoader.js";
import { parseAsStaticUrl, parseAsEntityUrl, getLocaleFromUrl } from "../ssr/parseNonProdUrl.js";
import { findTemplateModuleInternalByName } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import sendAppHTML from "./sendAppHTML.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import { generateTestDataForPage } from "../ssr/generateTestData.js";
import { entityPageCriterion, getLocalData } from "../ssr/getLocalData.js";
import send404 from "./send404.js";
import { findStaticTemplateModuleAndDocBySlug } from "../ssr/findMatchingStaticTemplate.js";
import { getInPlatformPageSetDocuments, PageSetConfig } from "../ssr/inPlatformPageSets.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
  siteId?: number;
  inPlatformPageSets: PageSetConfig[];
};

export const serverRenderRoute =
  ({
    vite,
    dynamicGenerateData,
    projectStructure,
    siteId,
    inPlatformPageSets,
  }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      const locale = getLocaleFromUrl(url) ?? "en";
      const templateFilepaths = getTemplateFilepathsFromProjectStructure(projectStructure);

      const { staticURL } = parseAsStaticUrl(url);
      const { entityId, feature } = parseAsEntityUrl(url);

      // First, match the feature name to an in-platform page set id
      let pageSet: PageSetConfig | undefined = undefined;
      for (const ps of inPlatformPageSets) {
        if (ps.id === feature) {
          pageSet = ps;
          break;
        }
      }

      // If no in-platform page set found, try to render a static page
      if (!pageSet) {
        const staticTemplateAndProps = await findStaticTemplateModuleAndDocBySlug(
          vite,
          templateFilepaths,
          false,
          staticURL,
          locale
        );

        if (staticTemplateAndProps) {
          await sendAppHTML(
            res,
            staticTemplateAndProps.staticTemplateModuleInternal,
            staticTemplateAndProps.props,
            vite,
            req.originalUrl,
            projectStructure
          );
          return;
        }
      }

      if (!entityId || !feature) {
        send404(res, `Cannot find template with URL "${url}"`);
        return;
      }

      // Look up the template by code_template if in-platform or feature if in-repo
      const templateModuleInternal =
        siteId && pageSet
          ? await findTemplateModuleInternalByName(
              vite,
              pageSet.code_template,
              templateFilepaths,
              true
            )
          : await findTemplateModuleInternalByName(vite, feature, templateFilepaths, false);
      if (!templateModuleInternal) {
        send404(
          res,
          pageSet
            ? `Cannot find template: ${pageSet.code_template}`
            : `Cannot find template corresponding to feature: ${feature}`
        );
        return;
      }

      const document =
        siteId && pageSet
          ? (
              await getInPlatformPageSetDocuments(siteId, pageSet.id, {
                entityIds: [entityId],
                locale,
              })
            )?.[0]
          : await getDocument(
              dynamicGenerateData,
              templateModuleInternal,
              entityId,
              locale,
              projectStructure
            );
      if (!document) {
        send404(
          res,
          `Cannot find document document data for entityId and locale: ${entityId} ${locale}`
        );
        return;
      }

      // If loaded via POST request, merge visual editor overrides
      if (req.method === "POST") {
        const overrides = JSON.parse(req?.body?.overrides ?? "{}");
        merge(document, overrides);
      }

      const props = await propsLoader({
        templateModuleInternal,
        document,
      });
      await sendAppHTML(
        res,
        templateModuleInternal,
        props,
        vite,
        req.originalUrl,
        projectStructure
      );
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };

const getDocument = async (
  dynamicGenerateData: boolean,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  entityId: string,
  locale: string,
  projectStructure: ProjectStructure
) => {
  if (dynamicGenerateData) {
    const featuresConfig = convertTemplateConfigInternalToFeaturesConfig(
      templateModuleInternal.config
    );

    return generateTestDataForPage(
      process.stdout,
      featuresConfig,
      entityId,
      locale,
      projectStructure
    );
  }

  return (
    await getLocalData(entityPageCriterion(entityId, templateModuleInternal.config.name, locale))
  )?.document;
};
