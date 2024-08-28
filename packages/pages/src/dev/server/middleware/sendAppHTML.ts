import { ViteDevServer } from "vite";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import {
  ServerRenderTemplate,
  TemplateRenderProps,
} from "../../../common/src/template/types.js";
import { getLang } from "../../../common/src/template/head.js";
import { Response } from "express-serve-static-core";
import { getContentType } from "./getContentType.js";
import { getGlobalClientServerRenderTemplates } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import {
  getHydrationTemplateDev,
  getIndexTemplateDev,
} from "../../../common/src/template/hydration.js";
import {
  getTemplateModules,
  getTemplatesConfig,
} from "../../../generate/templates/createTemplatesJson.js";
import { FeaturesConfig } from "../../../common/src/feature/features.js";
import { readSiteStream } from "../../../common/src/feature/stream.js";
/**
 * Renders the HTML for a given {@link TemplateModuleInternal}
 * and {@link TemplateRenderProps}, and sends it back to the Response.
 */
export default async function sendAppHTML(
  res: Response,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  props: TemplateRenderProps,
  vite: ViteDevServer,
  pathname: string,
  projectStructure: ProjectStructure
) {
  if (templateModuleInternal.render) {
    res
      .status(200)
      .type(getContentType(templateModuleInternal, props))
      .end(templateModuleInternal.render(props));
    return;
  }

  const clientServerRenderTemplates = getGlobalClientServerRenderTemplates(
    projectStructure.getTemplatePaths()
  );

  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  const clientHydrationString = getHydrationTemplateDev(
    clientServerRenderTemplates.clientRenderTemplatePath,
    templateModuleInternal.path,
    props,
    templateModuleInternal.config.hydrate
  );

  const serverRenderTemplateModule = (await vite.ssrLoadModule(
    clientServerRenderTemplates.serverRenderTemplatePath
  )) as ServerRenderTemplate;

  const { templateModules, redirectModules } =
    await getTemplateModules(projectStructure);
  const templatesConfig: FeaturesConfig = getTemplatesConfig(
    templateModules,
    redirectModules
  );

  const siteStream = readSiteStream(projectStructure);

  const clientInjectedIndexHtml = getIndexTemplateDev(
    clientHydrationString,
    serverRenderTemplateModule.getIndexHtml
      ? await serverRenderTemplateModule.getIndexHtml({
          Page: templateModuleInternal.default!,
          pageProps: props,
        })
      : serverRenderTemplateModule.indexHtml,
    getLang(headConfig, props),
    templatesConfig,
    siteStream,
    headConfig
  );

  const transformedIndexHtml = await vite.transformIndexHtml(
    // Vite decodes request urls when caching proxy requests so we have to
    // load the transform request with a decoded uri. Additionally we add
    // a date to cache bust the module path so that props are updated upon
    // page refresh, otherwise Vite caches it.
    decodeURIComponent(pathname) + Date.now(),
    clientInjectedIndexHtml
  );

  const getServerHtml = async () => {
    // using this wrapper function prevents SSR client-server mistmatches if
    // the template modifies props
    return await serverRenderTemplateModule.render({
      Page: templateModuleInternal.default!,
      pageProps: props,
    });
  };

  const html = transformedIndexHtml.replace(
    serverRenderTemplateModule.getReplacementTag
      ? await serverRenderTemplateModule.getReplacementTag()
      : serverRenderTemplateModule.replacementTag,
    await getServerHtml()
  );

  // Send the rendered HTML back.
  res.status(200).type(getContentType(templateModuleInternal, props)).end(html);
}
