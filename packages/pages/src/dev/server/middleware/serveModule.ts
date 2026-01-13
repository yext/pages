import { ModuleInternal } from "../../../common/src/module/internal/types.js";
import { ViteDevServer } from "vite";
import { getGlobalClientServerRenderModules } from "../../../common/src/module/internal/getModuleFilepaths.js";
import { Response } from "express-serve-static-core";
import { ServerModuleRenderTemplate } from "../../../common/src/module/types.js";
import { getHydrationModuleDev, getIndexModuleDev } from "../../../common/src/module/hydration.js";

/**
 * Renders the HTML for a given {@link ModuleInternal}, and sends it back to the Response.
 */
export default async function serveModule(
  res: Response,
  moduleInternal: ModuleInternal,
  vite: ViteDevServer,
  pathname: string
) {
  const clientServerRenderModules = getGlobalClientServerRenderModules();

  const clientHydrationString = getHydrationModuleDev(
    clientServerRenderModules.clientRenderModulePath,
    moduleInternal.path
  );

  const serverRenderTemplateModule = (await vite.ssrLoadModule(
    clientServerRenderModules.serverRenderModulePath
  )) as ServerModuleRenderTemplate;

  const clientInjectedIndexHtml = getIndexModuleDev(
    clientHydrationString,
    serverRenderTemplateModule.indexHtml
  );

  const transformedIndexHtml = await vite.transformIndexHtml(
    // Vite decodes request urls when caching proxy requests, so we have to
    // load the transform request with a decoded uri. Additionally, we add
    // a date to cache bust the module path so that props are updated upon
    // page refresh, otherwise Vite caches it.
    decodeURIComponent(pathname) + Date.now(),
    clientInjectedIndexHtml
  );

  const getServerHtml = async () => {
    // using this wrapper function prevents SSR client-server mistmatches if
    // the template modifies props
    return await serverRenderTemplateModule.render({
      Page: moduleInternal.default!,
    });
  };

  const html = transformedIndexHtml.replace(
    serverRenderTemplateModule.replacementTag,
    await getServerHtml()
  );

  // Send the rendered HTML back.
  res.status(200).type("text/html").end(html);
}
