import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import { urlToFeature } from "../ssr/urlToFeature.js";
import page404 from "../public/404.js";
import { featureNameToTemplateModuleInternal } from "../ssr/featureNameToTemplateModuleInternal.js";
import {
  renderHeadConfigToString,
  getLang,
} from "../../../common/src/template/head.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import templateBase from "../public/templateBase.js";
import { lookup } from "mime-types";
import { getTemplateFilepaths } from "../../../common/src/template/internal/getTemplateFilepaths.js";

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

      const templateFilepaths = getTemplateFilepaths(
        projectStructure.scopedTemplatesPath
          ? [
              projectStructure.scopedTemplatesPath,
              projectStructure.templatesRoot,
            ]
          : [projectStructure.templatesRoot]
      );
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

      const props = await propsLoader({
        templateModuleInternal,
        entityId,
        locale,
        dynamicGenerateData,
        projectStructure,
      });

      if (templateModuleInternal.render) {
        res
          .status(200)
          .type(getContentType(templateModuleInternal, props))
          .end(templateModuleInternal.render(props));
        return;
      }

      const React = await import("react");
      const ReactDOMServer = await import("react-dom/server");

      const appHtml = ReactDOMServer.renderToString(
        React.createElement(templateModuleInternal.default || "", props)
      );

      const headConfig = templateModuleInternal.getHeadConfig
        ? templateModuleInternal.getHeadConfig(props)
        : undefined;

      const template = await vite.transformIndexHtml(
        url.pathname,
        templateBase
      );

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
      res
        .status(200)
        .type(getContentType(templateModuleInternal, props))
        .end(html);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };

/**
 * Returns the content type based on the getPath's extension. Falls back to 'text/html'.
 */
const getContentType = (
  templateModuleInternal: TemplateModuleInternal<any, any>,
  props: any
) => {
  // TODO: once custom headers are supported at the template level use that instead,
  // with a fallback to the current logic.
  const path = templateModuleInternal.getPath(props);

  return lookup(path) || "text/html";
};
