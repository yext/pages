import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import {
  parseAsStaticUrl,
  parseAsEntityUrl,
  getLocaleFromUrl,
} from "../ssr/parseNonProdUrl.js";
import { findTemplateModuleInternal } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import sendAppHTML from "./sendAppHTML.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import { generateTestDataForPage } from "../ssr/generateTestData.js";
import { entityPageCriterion, getLocalData } from "../ssr/getLocalData.js";
import { findStaticTemplateModuleAndDocByTemplateName } from "../ssr/findMatchingStaticTemplate.js";
import send404 from "./send404.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData, projectStructure }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      const locale = getLocaleFromUrl(url) ?? "en";
      const templateFilepaths =
        getTemplateFilepathsFromProjectStructure(projectStructure);

      const { staticURL } = parseAsStaticUrl(url);

      const staticTemplateAndProps =
        await findStaticTemplateModuleAndDocByTemplateName(
          vite,
          templateFilepaths,
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

      const { feature, entityId } = parseAsEntityUrl(url);
      if (!entityId || !feature) {
        send404(res, `Cannot find template with URL "${url}"`);
        return;
      }

      const templateModuleInternal = await findTemplateModuleInternal(
        vite,
        async (t) => feature === t.config.name,
        templateFilepaths
      );
      if (!templateModuleInternal) {
        send404(
          res,
          `Cannot find template corresponding to feature: ${feature}`
        );
        return;
      }

      const document = await getDocument(
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

  return getLocalData(
    entityPageCriterion(entityId, templateModuleInternal.config.name, locale)
  );
};
