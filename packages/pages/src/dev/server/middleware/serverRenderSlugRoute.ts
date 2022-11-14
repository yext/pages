import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import page404 from "../public/404.js";
import { findTemplateModuleInternal } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilePathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import sendAppHTML from "./sendAppHTML.js";
import { generateTestDataForSlug } from "../ssr/generateTestData.js";
import {
  getLocalDataForEntityOrStaticPage,
  getLocalDataForSlug,
} from "../ssr/getLocalData.js";
import { isStaticTemplateConfig } from "../../../common/src/feature/features.js";

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
      const locale = req.query.locale?.toString() ?? "en";
      const slug = url.pathname.substring(1);

      const templateFilepaths =
        getTemplateFilePathsFromProjectStructure(projectStructure);
      const matchingStaticTemplate = await findMatchingStaticTemplate(
        vite,
        slug,
        templateFilepaths
      );
      if (matchingStaticTemplate) {
        const document = await getLocalDataForEntityOrStaticPage({
          entityId: "",
          featureName: matchingStaticTemplate.config.name,
          locale,
        });
        const props: TemplateRenderProps = await propsLoader({
          templateModuleInternal: matchingStaticTemplate,
          locale,
          document,
        });
        sendAppHTML(res, matchingStaticTemplate, props, vite, url.pathname);
        return;
      }

      const document = await getDocument(
        dynamicGenerateData,
        slug,
        locale,
        projectStructure
      );
      const feature = document.__.name;
      const entityId = document.id;
      const templateModuleInternal = await findTemplateModuleInternal(
        vite,
        (t) => feature === t.config.name,
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

const findMatchingStaticTemplate = async (
  vite: ViteDevServer,
  slug: string,
  templateFilePaths: string[]
) => {
  return findTemplateModuleInternal(
    vite,
    (t) => {
      if (!isStaticTemplateConfig(t.config)) {
        return false;
      }
      try {
        return slug === t.getPath({});
      } catch {
        console.error(
          `Error executing getPath() for slug: "${slug}", skipping.`
        );
      }
    },
    templateFilePaths
  );
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
  return getLocalDataForSlug({ slug, locale });
};
