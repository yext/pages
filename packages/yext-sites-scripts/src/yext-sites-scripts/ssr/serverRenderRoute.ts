import { buildFeatureConfig } from './buildFeatureConfig.js';
import { getTemplateConfig } from './getTemplateConfig.js';
import { RequestHandler } from 'express-serve-static-core';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';
import { ViteDevServer } from 'vite';
import { featureToTemplate } from './featureToTemplate.js';
import { pageLoader } from './pageLoader.js';
import { urlToFeature } from './urlToFeature.js';
import page404 from '../../error-pages/404';
import page500 from '../../error-pages/500';

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData }: Props): RequestHandler =>
    async (req, res, next) => {
      const url = req.originalUrl;

      const { feature, entityId } = urlToFeature(url);

      let templateFilename = null;
      try {
        templateFilename = await featureToTemplate(vite, feature);
      } catch (e: any) {
        console.error(e);
        return res.status(500).end(await vite.transformIndexHtml(url, page500));
      }

      if (!templateFilename) {
        return res.status(404).end(page404);
      }

      const templateConfig = await getTemplateConfig(vite, templateFilename);
      const featureConfig = buildFeatureConfig(templateConfig);

      try {
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
        // If an error is caught, let vite fix the stracktrace so it maps back to
        // your actual source code.
        vite.ssrFixStacktrace(e);
        next(e);
      }
    };
