import { convertToPosixPath } from "../template/paths.js";

export const getHydrationModuleDev = (
  clientRenderTemplatePath: string,
  modulePath: string
): string => {
  let hydrationTemplate = `
  import {default as Component} from "${convertToPosixPath(modulePath)}";
  `;

  hydrationTemplate += `
    import {render} from "${convertToPosixPath(clientRenderTemplatePath)}";
    render(
    {
        Page: Component,
    }
    );
  `;

  return hydrationTemplate;
};
