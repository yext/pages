import { ProjectStructure } from "../../../common/src/project/structure.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import { getLocalDataForEntityOrStaticPage } from "../ssr/getLocalData.js";
import { propsLoader } from "../ssr/propsLoader.js";
import sendAppHTML from "./sendAppHTML.js";
import { Response } from "express-serve-static-core";
import { ViteDevServer } from "vite";

/**
 * Renders the HTML for a static {@link TemplateModuleInternal},
 * and sends it back to the Response.
 */
export default async function sendStaticPage(
  res: Response,
  vite: ViteDevServer,
  matchingStaticTemplate: TemplateModuleInternal<any, any>,
  locale: string,
  templatePath: string,
  projectStructure: ProjectStructure,
) {
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
  await sendAppHTML(
    res,
    matchingStaticTemplate,
    props,
    vite,
    templatePath,
    projectStructure,
  );
}
