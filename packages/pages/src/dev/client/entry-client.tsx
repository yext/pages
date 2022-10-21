import * as ReactDOM from "react-dom";
import * as React from "react";

const hydrate = async () => {
  /** Get the templatePath from the template. See {@link ./ssr/serverRenderRoute.ts}. */
  const templatePath: string = (window as any)._RSS_TEMPLATE_PATH_;
  const { default: Component } = await import(templatePath);

  if (!Component) {
    console.error("Default export missing in template: " + templatePath);
    return;
  }

  ReactDOM.hydrate(
    <Component {...(window as any)._RSS_PROPS_} />,
    document.getElementById("reactele")
  );
};

hydrate();
