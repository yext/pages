import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import { urlToFeature } from "../ssr/urlToFeature.js";
import { findTemplateModuleInternal } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import sendAppHTML from "./sendAppHTML.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import { generateTestDataForPage } from "../ssr/generateTestData.js";
import { getLocalDataForEntityOrStaticPage } from "../ssr/getLocalData.js";
import sendStaticPage from "./sendStaticPage.js";
import findMatchingStaticTemplate from "../ssr/findMatchingStaticTemplate.js";
import send404 from "./send404.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
  defaultLocale: string;
};

export const serverRenderRoute =
  ({
    vite,
    dynamicGenerateData,
    projectStructure,
    defaultLocale,
  }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      const { feature, entityId, locale, staticURL } = urlToFeature(url);

      const templateFilepaths =
        getTemplateFilepathsFromProjectStructure(projectStructure);
      const matchingStaticTemplate: TemplateModuleInternal<any, any> | null =
        await findMatchingStaticTemplate(vite, staticURL, templateFilepaths);
      if (matchingStaticTemplate) {
        await sendStaticPage(
          res,
          vite,
          matchingStaticTemplate,
          locale ?? defaultLocale,
          url.pathname,
          projectStructure
        );
        return;
      } else if (!entityId) {
        send404(
          res,
          `Cannot find static template with getPath() equal to "${staticURL}"`
        );
        return;
      }

      const templateModuleInternal = await findTemplateModuleInternal(
        vite,
        (t) => feature === t.config.name,
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
      const props = await propsLoader({
        templateModuleInternal,
        entityId,
        locale,
        document,
      });
      sendAppHTML(
        res,
        templateModuleInternal,
        props,
        vite,
        url.pathname,
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
  return getLocalDataForEntityOrStaticPage({
    entityId,
    locale,
    featureName: templateModuleInternal.config.name,
  });
};
