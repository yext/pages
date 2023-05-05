import { ViteDevServer, transformWithEsbuild } from "vite";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import {
  RenderTemplate,
  TemplateRenderProps,
} from "../../../common/src/template/types.js";
import {
  renderHeadConfigToString,
  getLang,
} from "../../../common/src/template/head.js";
import { Response } from "express-serve-static-core";
import { getContentType } from "./getContentType.js";
import { getGlobalClientServerRenderTemplates } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import fs from "node:fs";
import send404 from "./send404.js";

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
    projectStructure.templatesRoot,
    projectStructure.scopedTemplatesPath
  );

  const serverRenderTemplateModule = (await vite.ssrLoadModule(
    clientServerRenderTemplates.serverRenderTemplatePath
  )) as RenderTemplate;

  const serverHtml = await serverRenderTemplateModule.render({
    Page: templateModuleInternal.default!,
    pageProps: props,
  });

  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  if (clientServerRenderTemplates.usingBuiltInDefault) {
    serverHtml.replace("<!--app-lang-->", getLang(headConfig, props));
    serverHtml.replace(
      "<!--app-head-->",
      headConfig ? renderHeadConfigToString(headConfig) : ""
    );
  }
  // If the user has defined a custom render template AND they've defined `getHeadConfig` in their template, error out.
  else if (headConfig) {
    return send404(
      res,
      "getHeadConfig cannot be defined when a custom render template (_client.tsx or _server.tsx) is used."
    );
  }
  // If the user has defined a custom render template then they must define a <head> tag.
  else if (serverHtml.indexOf("</head>") === -1) {
    return send404(
      res,
      "No head tag is defined in your custom server render template."
    );
  }

  // Read the client render template. It requires adding an import of the component as well as calling
  // the render function since it is injected as a script module and imported as a virtual module by Vite.
  let clientHtml = fs.readFileSync(
    clientServerRenderTemplates.clientRenderTemplatePath,
    "utf-8"
  );

  // The component import and render call are necessary for HMR to work
  const preamble = `import {default as Component} from "${templateModuleInternal.path}";`;
  const postamble = `
  render(
    {
      Page: Component,
      pageProps: ${JSON.stringify(props)},
    }
    );`;

  // Compile the tsx for the browser since the code is shoved in as a module
  clientHtml = (await transformWithEsbuild(clientHtml, "_client.tsx")).code;
  const updatedClientHtml = preamble + clientHtml + postamble;

  // Inject a module script into the server render. The script itself is the client render that
  // uses the appropriate template component. It's similar to a default Vite project where there is an index.html
  // entrypoint (our _server.tsx) that has a module script with a src that points to a main.tsx (_client.tsx)
  // which calls React.hydrate on a defined component. The difference for us is that we determine which
  // template component to render dynamically, while also allowing the user to customize the client/server
  // render functions.
  const closingHeadIndex = serverHtml.indexOf("</head>");
  const injectedServerHtml =
    serverHtml.slice(0, closingHeadIndex) +
    `<script type="module">${updatedClientHtml}</script>` +
    serverHtml.slice(closingHeadIndex);

  const html = await vite.transformIndexHtml(pathname, injectedServerHtml);

  // Send the rendered HTML back.
  res.status(200).type(getContentType(templateModuleInternal, props)).end(html);
}
