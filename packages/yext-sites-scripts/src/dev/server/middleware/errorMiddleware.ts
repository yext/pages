import { ViteDevServer } from 'vite';
import { ErrorRequestHandler } from 'express';
import Convert from 'ansi-to-html';
import escapeHtml from 'escape-html';
import page500 from '../public/500'

export const errorMiddleware = (vite : ViteDevServer): ErrorRequestHandler =>
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