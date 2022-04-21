import express, { ErrorRequestHandler } from 'express';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { serverRenderRoute } from './yext-sites-scripts/ssr/serverRenderRoute.js';
import { getServerSideProps } from './yext-sites-scripts/ssr/getServerSideProps.js';
import react from '@vitejs/plugin-react';
import escapeHtml from 'escape-html';
import page500 from './error-pages/500'
import Convert from 'ansi-to-html';

export const createServer = async (dynamicGenerateData: boolean) => {
  // creates a standard express app
  const app = express();

  // create vite using ssr mode
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
    plugins: [react()],
    // Temporary solution https://github.com/vitejs/vite/issues/6215
    optimizeDeps: {
      include: ['react/jsx-runtime'],
    },
  });
  // register vite's middleware
  app.use(vite.middlewares);

  // Ignore favicon requests if it doesn't exist
  app.use(ignoreFavicon);

  app.use('/data/*', getServerSideProps({ vite }));

  // when a page is requested, call our serverRenderRoute method
  app.use('*', serverRenderRoute({ vite, dynamicGenerateData }));

  app.use(errorMiddleware(vite));

  // start the server on port 3000
  app.listen(3000, () => process.stdout.write('listening on :3000\n'));
};

function ignoreFavicon(req: any, res: any, next: any) {
  if (req.originalUrl.includes('favicon')) {
    res.status(204).end();
    return;
  }
  next();
}

const errorMiddleware = (vite : ViteDevServer): ErrorRequestHandler =>
  async (err, req, res, next) => {
    try {
      // If an error is caught, let vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(err);

      console.error(err.toString());

      const errorString = err.stack ? String(err.stack) : err.toString();
      const canInspect = !err.stack && String(err) === toString.call(err);

      const topLevelError = !canInspect 
        ? escapeHtmlBlock(errorString.split('\n', 1)[0] || 'Error') 
        : 'Error';

      const stackTrace = !canInspect
        ? String(errorString).split('\n').slice(1)
        : [errorString];

      const ansiToHtmlConverter = new Convert({fg: "#000", bg: "#FFF"});

      const escapedStackTrace = stackTrace
        .map((unescapedLine) => '<li>' + ansiToHtmlConverter.toHtml(escapeHtmlBlock(unescapedLine)) + '</li>')
        .join('');

      const htmlResponseString = page500
        .replace("{stack}", escapedStackTrace)
        .replace("{title}", "Error 500")
        .replace("{statusCode}", "500")
        .replace(/\{error\}/g, topLevelError);

      res.status(500).end(await vite.transformIndexHtml(req.originalUrl, htmlResponseString));
    } catch (e: any) {
      console.error(e);
      next(e);
    }
};

const escapeHtmlBlock = (inputString: string): string => {
  const DOUBLE_SPACE_REGEXP = "/\x20{2}/g";
  const NEW_LINE_REGEXP = "/\n/g";

  return escapeHtml(inputString).replace(DOUBLE_SPACE_REGEXP, ' &nbsp;').replace(NEW_LINE_REGEXP, '<br>');
}
