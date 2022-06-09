import { PageLoaderResult } from "../ssr/pageLoader.js";
import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { pageLoader } from "../ssr/pageLoader.js";
import { urlToFeature } from "../ssr/urlToFeature.js";
import page404 from "../public/404";
import { convertTemplateConfigToFeaturesConfig } from "../../../../../common/src/feature/features.js";
import { validateTemplateModule } from "../../../../../common/src/template/validateTemplateModule.js";
import { featureNameToTemplateModule } from "../ssr/featureNameToTemplateModule.js";

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

      const templateModule = await featureNameToTemplateModule(vite, feature);
      if (!templateModule) {
        console.error(
          `Cannot find template corresponding to feature: ${feature}`
        );
        return res.status(404).end(page404);
      }

      validateTemplateModule(templateModule);

      const featuresConfig = convertTemplateConfigToFeaturesConfig(
        templateModule.config
      );

      const React = await import("react");
      const ReactDOMServer = await import("react-dom/server");

      const { template, Component, props }: PageLoaderResult = await pageLoader(
        {
          url,
          vite,
          templateFilename: templateModule.filename,
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
            window._RSS_TEMPLATE_ = '${templateModule.filename}';
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
