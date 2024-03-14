// Environment: server

import * as ReactDOMServer from "react-dom/server";
import * as React from "react";
import { ModuleContext } from "../types.js";

export const render = async (pageContext: ModuleContext) => {
  const { Page } = pageContext;

  return ReactDOMServer.renderToString(<Page />);
};

export const replacementTag = "<!--YEXT-SERVER-->";

export const indexHtml = `<!DOCTYPE html>
    <html lang="<!--app-lang-->">
      <head></head>
      <body>
        <div id="reactele">${replacementTag}</div>
      </body>
    </html>`;
