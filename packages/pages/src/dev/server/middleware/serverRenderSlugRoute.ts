import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import page404 from "../public/404.js";
import { featureNameToTemplateModuleInternal } from "../ssr/featureNameToTemplateModuleInternal.js";

import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilePathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import sendAppHTML from "./sendAppHTML.js";
import { generateTestDataForSlug } from "../ssr/generateTestData.js";
import { getLocalDataForSlug } from "../ssr/getLocalData.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export const serverRenderSlugRoute =
  ({ vite, dynamicGenerateData, projectStructure }: Props): RequestHandler =>
  async (req, res, next) => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      // Right now we're assuming this is the slug and not a static URL
      const slug = url.pathname.substring(1);
      const locale = req.query.locale?.toString() ?? "en";
      const templateFilepaths =
        getTemplateFilePathsFromProjectStructure(projectStructure);
      const document = await getDocument(
        dynamicGenerateData,
        slug,
        locale,
        projectStructure
      );
      const feature = document.__.name;
      const entityId = document.id;
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

      const props: TemplateRenderProps = await propsLoader({
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
  slug: string,
  locale: string,
  projectStructure: ProjectStructure
): Promise<any> => {
  if (dynamicGenerateData) {
    return generateTestDataForSlug(
      process.stdout,
      slug,
      locale,
      projectStructure
    );
  }
  return getLocalDataForSlug(slug, locale);
};
