import { convertToPosixPath } from "../template/paths.js";

export const getHydrationModuleDev = (
  clientRenderModulePath: string,
  modulePath: string
): string => {
  let hydrationTemplate = `
  import {default as Component} from "${convertToPosixPath(modulePath)}";
  `;

  hydrationTemplate += `
    import {render} from "${convertToPosixPath(clientRenderModulePath)}";
    render(
    {
        Page: Component,
    }
    );
  `;

  return hydrationTemplate;
};

/**
 * Use for the Vite dev server.
 *
 * @param clientHydrationString
 * @param indexHtml
 * @returns the server template to render in the Vite dev environment
 */
export const getIndexModuleDev = (
  clientHydrationString: string,
  indexHtml: string
): string => {
  return getCommonInjectedIndexHtml(clientHydrationString, indexHtml);
};

/**
 * Get the server template with injected html common to both the dev and plugin side of things.
 *
 * @param clientHydrationString if this is undefined then hydration is skipped
 * @param indexHtml
 * @returns the server template with injected html
 */
const getCommonInjectedIndexHtml = (
  clientHydrationString: string,
  indexHtml: string
): string => {
  indexHtml = injectIntoEndOfHead(
    indexHtml,
    `<script type="module">${clientHydrationString}</script>`
  );

  return indexHtml;
};

/**
 * Finds the ending </head> tag and injects the input string into it.
 * @param html
 * @param stringToInject
 */
const injectIntoEndOfHead = (html: string, stringToInject: string): string => {
  const closingHeadIndex = html.indexOf("</head>");

  if (closingHeadIndex === -1) {
    throw new Error("_server.tsx: No head tag is defined");
  }

  return (
    html.slice(0, closingHeadIndex) +
    stringToInject +
    html.slice(closingHeadIndex)
  );
};
