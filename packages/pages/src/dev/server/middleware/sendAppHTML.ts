import React from "react";
import ReactDOMServer from "react-dom/server.js";
import { ViteDevServer } from "vite";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { TemplateRenderProps } from "../../../common/src/template/types.js";
import templateBase from "../public/templateBase.js";
import {
  renderHeadConfigToString,
  getLang,
} from "../../../common/src/template/head.js";
import { Response } from "express-serve-static-core";
import { getContentType } from "./getContentType.js";

/**
 * Renders the HTML for a given {@link TemplateModuleInternal}
 * and {@link TemplateRenderProps}, and sends it back to the Response.
 */
export default async function sendAppHTML(
  res: Response,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  props: TemplateRenderProps,
  vite: ViteDevServer,
  pathname: string
) {
  if (templateModuleInternal.render) {
    res
      .status(200)
      .type(getContentType(templateModuleInternal, props))
      .end(templateModuleInternal.render(props));
    return;
  }

  const appHtml = ReactDOMServer.renderToString(
    React.createElement(templateModuleInternal.default || "", props)
  );

  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  const template = await vite.transformIndexHtml(pathname, templateBase);

  // Inject the app-rendered HTML into the template. Only invoke the users headFunction
  // if they are rendering by way of a default export and not a custom render function.
  const html = template.replace(`<!--app-html-->`, appHtml).replace(
    `<!--app-head-->`,
    `<head>
        <script type="text/javascript">
          window._RSS_PROPS_ = ${JSON.stringify(props)};
          window._RSS_TEMPLATE_PATH_ = '${templateModuleInternal.path}';
          window._RSS_LANG_ = '${getLang(headConfig, props)}';
        </script>
        ${headConfig ? renderHeadConfigToString(headConfig) : ""}
      </head>`
  );

  // Send the rendered HTML back.
  res.status(200).type(getContentType(templateModuleInternal, props)).end(html);
}
