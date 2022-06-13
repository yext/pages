import { PageLoaderResult } from "../ssr/pageLoader.js";
import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { pageLoader } from "../ssr/pageLoader.js";
import { urlToFeature } from "../ssr/urlToFeature.js";
import page404 from "../public/404";
import { convertTemplateConfigToFeaturesConfig } from "../../../../../common/src/feature/features.js";
import { validateTemplateModuleInternal } from "../../../../../common/src/template/internal/validateTemplateModuleInternal.js";
import { featureNameToTemplateModuleInternal } from "../ssr/featureNameToTemplateModuleInternal.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData }: Props): RequestHandler =>
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

      const featuresConfig = convertTemplateConfigToFeaturesConfig(
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
          feature,
        }
      );

      // render the component to its html
      // Since we are on the server using plain TS, and outside
      // of Vite, we are not using JSX here
      const appHtml = await ReactDOMServer.renderToString(
        React.createElement(Component, props)
      );

      // Inject the app-rendered HTML into the template.
      const html = template.replace(`<!--app-html-->`, appHtml).replace(
        "</head>",
        `<script type="text/javascript">
            window._RSS_PROPS_ = ${JSON.stringify(props)};
            window._RSS_TEMPLATE_ = '${templateModuleInternal.filename}';
          </script></head>`
      );

      // Send the rendered HTML back.
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };
