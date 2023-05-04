// Environment: browser

import ReactDOM from "react-dom";
import React from "react";
import { PageContext, TemplateRenderProps } from "../types.js";

export { render };

const render = async (pageContext: PageContext<TemplateRenderProps>) => {
  const { Page, pageProps } = pageContext;
  ReactDOM.hydrate(
    <Page {...pageProps} />,
    document.getElementById("reactele")
  );
};
