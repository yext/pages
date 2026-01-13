import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import { findTemplateModuleInternalByName } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import sendAppHTML from "./sendAppHTML.js";
import { generateTestDataForSlug } from "../ssr/generateTestData.js";
import { getLocalEntityPageDataForSlug } from "../ssr/getLocalData.js";
import { findStaticTemplateModuleAndDocBySlug } from "../ssr/findMatchingStaticTemplate.js";
import send404 from "./send404.js";
import { getInPlatformPageSetDocuments, PageSetConfig } from "../ssr/inPlatformPageSets.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
  siteId?: number;
  inPlatformPageSets: PageSetConfig[];
};

export const serverRenderSlugRoute =
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

      const slug = decodeURIComponent(url.pathname.substring(1));

      const templateFilepaths = getTemplateFilepathsFromProjectStructure(projectStructure);

      const staticTemplateAndProps = await findStaticTemplateModuleAndDocBySlug(
        vite,
        templateFilepaths,
        true,
        slug
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

      // If in-platform page sets exist, try to match the slug to a page set
      let document;
      if (siteId && inPlatformPageSets.length) {
        for (const ps of inPlatformPageSets) {
          document = (
            await getInPlatformPageSetDocuments(siteId, ps.id, {
              slug,
            })
          )?.[0];
          if (document) {
            break;
          }
        }
      }
      // If the document is not found (or there are no in-platform page sets),
      // get the document via local data or generate-test-data
      if (!document) {
        document = await getDocument(dynamicGenerateData, vite, slug, projectStructure);
      }

      if (!document) {
        send404(res, `Cannot find document corresponding to slug: ${slug}`);
        return;
      }

      const feature = document.__.codeTemplate || document.__.name;
      const templateModuleInternal = await findTemplateModuleInternalByName(
        vite,
        feature,
        templateFilepaths,
        Boolean(document.__.codeTemplate)
      );
      if (!templateModuleInternal) {
        send404(res, `Cannot find template corresponding to feature: ${feature}`);
        return;
      }

      const props: TemplateRenderProps = await propsLoader({
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
  vite: ViteDevServer,
  slug: string,
  projectStructure: ProjectStructure
): Promise<any> => {
  if (dynamicGenerateData) {
    return generateTestDataForSlug(process.stdout, vite, slug, projectStructure);
  }
  return getLocalEntityPageDataForSlug(slug);
};
