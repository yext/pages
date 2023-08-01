import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import { findTemplateModuleInternal } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import sendAppHTML from "./sendAppHTML.js";
import { generateTestDataForSlug } from "../ssr/generateTestData.js";
import { getLocalDataForSlug } from "../ssr/getLocalData.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import sendStaticPage from "./sendStaticPage.js";
import findMatchingStaticTemplate from "../ssr/findMatchingStaticTemplate.js";
import send404 from "./send404.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
  defaultLocale: string;
};

export const serverRenderSlugRoute =
  ({
    vite,
    dynamicGenerateData,
    projectStructure,
    defaultLocale,
  }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      const locale = req.query.locale?.toString() ?? defaultLocale;
      const slug = decodeURIComponent(url.pathname.substring(1));

      const templateFilepaths =
        getTemplateFilepathsFromProjectStructure(projectStructure);
      const matchingStaticTemplate: TemplateModuleInternal<any, any> | null =
        await findMatchingStaticTemplate(vite, slug, templateFilepaths);
      if (matchingStaticTemplate) {
        await sendStaticPage(
          res,
          vite,
          matchingStaticTemplate,
          locale,
          url.pathname,
          projectStructure
        );
        return;
      }

      const document = await getDocument(
        dynamicGenerateData,
        vite,
        slug,
        locale,
        projectStructure
      );
      if (!document) {
        send404(res, `Cannot find document corresponding to slug: ${slug}`);
        return;
      }

      const feature = document.__.name;
      const entityId = document.id;
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

      const props: TemplateRenderProps = await propsLoader({
        templateModuleInternal,
        entityId,
        locale,
        document,
      });
      await sendAppHTML(
        res,
        templateModuleInternal,
        props,
        vite,
        `/${slug}`,
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
  vite: ViteDevServer,
  slug: string,
  locale: string,
  projectStructure: ProjectStructure
): Promise<any> => {
  if (dynamicGenerateData) {
    return generateTestDataForSlug(
      process.stdout,
      vite,
      slug,
      locale,
      projectStructure
    );
  }
  return getLocalDataForSlug({ slug, locale });
};
