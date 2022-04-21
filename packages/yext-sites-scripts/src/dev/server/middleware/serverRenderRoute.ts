import { buildFeatureConfig } from '../ssr/buildFeatureConfig.js';
import { getTemplateConfig } from '../ssr/getTemplateConfig.js';
import { RequestHandler } from 'express-serve-static-core';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';
import { ViteDevServer } from 'vite';
import { featureToTemplate } from '../ssr/featureToTemplate.js';
import { pageLoader } from '../ssr/pageLoader.js';
import { urlToFeature } from '../ssr/urlToFeature.js';
import page404 from '../public/404';

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData }: Props): RequestHandler =>
  async (req, res, next) => {
    try {
      const url = req.originalUrl;

      const { feature, entityId } = urlToFeature(url);

      const templateFilename = await featureToTemplate(vite, feature);
      if (!templateFilename) {
        return res.status(404).end(page404);
      }

      const templateConfig = await getTemplateConfig(vite, templateFilename);
      const featureConfig = buildFeatureConfig(templateConfig);

      const { template, Page, App, props } = await pageLoader({
        url,
        vite,
        templateFilename,
        entityId,
        featureConfig,
        dynamicGenerateData,
      });

      // render the component to its html
      // Since we are on the server using plain TS, and outside
      // of Vite, we are not using JSX here
      const appHtml = await ReactDOMServer.renderToString(
        React.createElement(App, {
          page: {
            props,
            path: req.originalUrl,
            component: Page,
          },
        }),
      );

      // Inject the app-rendered HTML into the template.
      const html = template.replace(`<!--app-html-->`, appHtml).replace(
        '</head>',
        `<script type="text/javascript">
            window._RSS_PROPS_ = ${JSON.stringify(props)};
            window._RSS_TEMPLATE_ = '${templateFilename}';
          </script></head>`,
      );

      // Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };
