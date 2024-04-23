// Environment: browser

import * as ReactDOM from "react-dom";
import * as React from "react";
import { ModuleContext } from "../types.js";

export { render };

const render = async (moduleContext: ModuleContext) => {
  const { Page } = moduleContext;
  ReactDOM.hydrate(<Page />, document.getElementById("reactele")!);
};
