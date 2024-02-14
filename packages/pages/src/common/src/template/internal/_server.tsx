// Environment: server

import * as ReactDOMServer from "react-dom/server";
import * as React from "react";
import { PageContext } from "../types.js";

export const render = async (pageContext: PageContext<any>) => {
  const { Page, pageProps } = pageContext;

  return ReactDOMServer.renderToString(<Page {...pageProps} />);
};

export const replacementTag = "<!--YEXT-SERVER-->";

export const indexHtml = `<!DOCTYPE html>
    <html lang="<!--app-lang-->">
      <head></head>
      <body>
        <div id="reactele">${replacementTag}</div>
      </body>
    </html>`;
