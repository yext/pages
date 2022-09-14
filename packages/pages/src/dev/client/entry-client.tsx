import * as ReactDOM from "react-dom";
import * as React from "react";

const hydrate = async () => {
  type Route = {
    name: string;
    path: string;
    getComponent: () => Promise<any>;
  };

  // Can't use string interpolation here so src/templates is hardcoded
  const templates = import.meta.glob("/src/templates/*.(jsx|tsx)");

  const routes: Route[] = Object.keys(templates).map((path) => {
    return {
      // get the filename from the path and remove its extension, default to index
      name: path.split("/").pop()?.split(".")[0] || "index",
      path,
      getComponent: templates[path],
    };
  });

  /**
   * Get the templateFilename from the template. See {@link ./ssr/serverRenderRoute.ts}.
   */
  const templateFilename = (window as any)._RSS_TEMPLATE_;
  const templateFilenameWithoutSuffix = templateFilename?.split(".")[0];

  const template = routes.find(
    (route) => route.name === templateFilenameWithoutSuffix
  ) || {
    name: templateFilename?.split(".")[0],
    path: `/src/templates/${templateFilename}`,
    getComponent: function (): Promise<any> {
      throw new Error("Function not implemented.");
    },
  };

  const { default: Component, render } = await template.getComponent();

  if (!Component && !render) {
    console.error(
      "Either a default export or render function is required in template: " +
        template.path
    );
    return;
  }

  ReactDOM.hydrate(
    render ? render() : <Component {...(window as any)._RSS_PROPS_} />,
    document.getElementById("root")
  );
};

hydrate();
