// Environment: browser

import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { PageContext } from "../types.js";

export { render };

const render = async (pageContext: PageContext<any>) => {
  const { Page, pageProps } = pageContext;
  ReactDOM.hydrateRoot(document.getElementById("reactele")!, <Page {...pageProps} />);
};
