import * as React from "react";
import * as ReactDOM from "react-dom/client";

const hydrate = async () => {
  type Route = {
    name: string;
    path: string;
    getComponent: () => Promise<any>;
  };

  // Can't use string interpolation here so src/templates is hardcoded
  const templates = import.meta.glob("/src/templates/**/*.(jsx|tsx)");

  const getTemplateName = (path: string) =>
    path.split("/").pop()?.split(".")[0] || "index";

  const routes: Route[] = Object.keys(templates).map((path) => {
    return {
      // get the filename from the path and remove its extension, default to index
      name: getTemplateName(path),
      path,
      getComponent: templates[path],
    };
  });

  /**
   * Get the templatePath from the template. See {@link ./ssr/serverRenderRoute.ts}.
   */
  const templatePath = (window as any)._RSS_TEMPLATE_PATH_;
  const template = routes.find((route) =>
    templatePath.endsWith(route.path)
  ) || {
    name: getTemplateName(templatePath),
    path: templatePath,
    getComponent: function (): Promise<any> {
      throw new Error("Function not implemented.");
    },
  };

  const { default: Component } = await template.getComponent();

  if (!Component) {
    console.error("Default export missing in template: " + template.path);
    return;
  }

  const container = document.getElementById("reactele");
  if (container) {
    ReactDOM.hydrateRoot(
      container,
      <Component {...(window as any)._RSS_PROPS_} />
    );
  }
};

hydrate();
