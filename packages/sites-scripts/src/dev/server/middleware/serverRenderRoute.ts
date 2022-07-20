import { PageLoaderResult } from "../ssr/pageLoader.js";
import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { pageLoader } from "../ssr/pageLoader.js";
import { urlToFeature } from "../ssr/urlToFeature.js";
import page404 from "../public/404";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import { validateTemplateModuleInternal } from "../../../common/src/template/internal/validateTemplateModuleInternal.js";
import { featureNameToTemplateModuleInternal } from "../ssr/featureNameToTemplateModuleInternal.js";
import {
  renderHeadConfigToString,
  getLang,
} from "../../../common/src/template/head.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData, projectStructure }: Props): RequestHandler =>
  async (req, res, next) => {
    try {
      const url = req.baseUrl;

      const { feature, entityId } = urlToFeature(url);

      const templateModuleInternal = await featureNameToTemplateModuleInternal(
        vite,
        feature
      );
      if (!templateModuleInternal) {
        console.error(
          `Cannot find template corresponding to feature: ${feature}`
        );
        return res.status(404).end(page404);
      }

      validateTemplateModuleInternal(templateModuleInternal);

      const featuresConfig = convertTemplateConfigInternalToFeaturesConfig(
        templateModuleInternal.config
      );

      const React = await import("react");
      const ReactDOMServer = await import("react-dom/server");

      const { template, Component, props }: PageLoaderResult = await pageLoader(
        {
          url,
          vite,
          templateFilename: templateModuleInternal.filename,
          entityId,
          featuresConfig,
          dynamicGenerateData,
          projectStructure,
        }
      );

      // render the component to its html
      // Since we are on the server using plain TS, and outside
      // of Vite, we are not using JSX here
      const appHtml = await ReactDOMServer.renderToString(
        React.createElement(Component, props)
      );

      const headConfig = templateModuleInternal.getHeadConfig
        ? templateModuleInternal.getHeadConfig(props)
        : undefined;
      const lang = getLang(headConfig, props);

      // Inject the app-rendered HTML into the template. Only invoke the users headFunction
      // if they are rendering by way of a default export and not a custom render function.
      const html = template.replace(`<!--app-html-->`, appHtml).replace(
        `<!--app-head-->`,
        `<head>
            <script type="text/javascript">
              window._RSS_PROPS_ = ${JSON.stringify(props)};
              window._RSS_TEMPLATE_ = '${templateModuleInternal.filename}';
              window._RSS_LANG_ = '${lang}';
            </script>
            ${
              !templateModuleInternal.render && headConfig
                ? renderHeadConfigToString(headConfig)
                : ""
            }
          </head>`
      );

      // Send the rendered HTML back.
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };
