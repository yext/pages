import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import { urlToFeature } from "../ssr/urlToFeature.js";
import page404 from "../public/404.js";
import { featureNameToTemplateModuleInternal } from "../ssr/featureNameToTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilePathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import sendAppHTML from "./sendAppHTML.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import { generateTestDataForPage } from "../ssr/generateTestData.js";
import { getLocalDataForEntity } from "../ssr/getLocalData.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData, projectStructure }: Props): RequestHandler =>
  async (req, res, next) => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      const { feature, entityId, locale } = urlToFeature(url);

      const templateFilepaths =
        getTemplateFilePathsFromProjectStructure(projectStructure);
      const templateModuleInternal = await featureNameToTemplateModuleInternal(
        vite,
        feature,
        templateFilepaths
      );
      if (!templateModuleInternal) {
        console.error(
          `Cannot find template corresponding to feature: ${feature}`
        );
        return res.status(404).end(page404);
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

      sendAppHTML(res, templateModuleInternal, props, vite, url.pathname);
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
  return getLocalDataForEntity(entityId, locale);
};
