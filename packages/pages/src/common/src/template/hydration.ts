import { HeadConfig, renderHeadConfigToString } from "./head.js";
import { TemplateRenderProps } from "./types.js";

/**
 * Imports the custom hydration template and entrypoint template as modules and calls
 * the render function.
 *
 * @param clientRenderTemplatePath the path to the custom client render template
 * @param templateModulePath the path to the template module
 * @param props the {@link TemplateRenderProps}
 * @returns the HTML as a string
 */
export const getHydrationTemplate = (
  clientRenderTemplatePath: string,
  templateModulePath: string,
  props: TemplateRenderProps
): string => {
  return `
        import {default as Component} from "${templateModulePath}";
        import {render} from "${clientRenderTemplatePath}";
        render(
        {
            Page: Component,
            pageProps: ${JSON.stringify(props)},
        }
        );
    `;
};

/**
 * Get the server template with injected html common to both the dev and plugin side of things.
 * For the most part, injects data into the <head> tag. It also provides validation.
 *
 * @param clientHtml
 * @param serverHtml
 * @param appLanguage
 * @param headConfig
 * @returns the server template with injected html
 */
const getCommonInjectedServerHtml = (
  clientHtml: string,
  serverHtml: string,
  appLanguage: string,
  headConfig?: HeadConfig
): string => {
  validateHeadTagExists(serverHtml);

  // Add the language to the <html> tag if it exists
  serverHtml.replace("<!--app-lang-->", appLanguage);

  serverHtml = injectIntoHead(
    serverHtml,
    `<script type="module">${clientHtml}</script>`
  );

  if (headConfig) {
    serverHtml = injectIntoHead(
      serverHtml,
      renderHeadConfigToString(headConfig)
    );
  }

  return serverHtml;
};

/**
 * Use for the Vite dev server.
 *
 * @param clientHtml
 * @param serverHtml
 * @param appLanguage
 * @param headConfig
 * @returns the server template to render in the Vite dev environment
 */
export const getServerTemplateDev = (
  clientHtml: string,
  serverHtml: string,
  appLanguage: string,
  headConfig?: HeadConfig
): string => {
  return getCommonInjectedServerHtml(
    clientHtml,
    serverHtml,
    appLanguage,
    headConfig
  );
};

/**
 * Used for the Deno plugin execution context. The major difference between this function
 * and {@link getServerTemplateDev} is that it also injects the CSS import tags which is
 * not required by Vite since those are injected automatically by the Vite dev server.
 *
 * @param clientHtml
 * @param serverHtml
 * @param templateFilepath
 * @param bundlerManifest
 * @param relativePrefixToRoot
 * @param appLanguage
 * @param headConfig
 * @returns the server template to render in the Deno plugin execution context when rendering HTML
 */
export const getServerTemplatePlugin = (
  clientHtml: string,
  serverHtml: string,
  templateFilepath: string,
  bundlerManifest: bundlerManifest,
  relativePrefixToRoot: string,
  appLanguage: string,
  headConfig?: HeadConfig
) => {
  let html = getCommonInjectedServerHtml(
    clientHtml,
    serverHtml,
    appLanguage,
    headConfig
  );
  html = injectIntoHead(
    html,
    getCssHtml(templateFilepath, bundlerManifest, relativePrefixToRoot)
  );

  return html;
};

type chunkName = string;
type bundlerManifest = Record<chunkName, ManifestInfo>;
type ManifestInfo = {
  file: string;
  src: string;
  isEntry: boolean;
  imports?: string[];
  css: string[];
};

const getCssHtml = (
  templateFilepath: string,
  bundlerManifest: bundlerManifest,
  relativePrefixToRoot: string
): string => {
  return Array.from(getCssTags(templateFilepath, bundlerManifest, new Set()))
    .map((f) => `<link rel="stylesheet" href="${relativePrefixToRoot + f}"/>`)
    .join("\n");
};

const getCssTags = (
  filepath: string,
  manifest: bundlerManifest,
  seen: Set<string>
): Set<string> => {
  const entry = structuredClone(
    Object.entries(manifest).find(([file]) => file === filepath)
  );
  if (!entry) {
    return new Set();
  }
  const [file, info] = entry;

  seen.add(file);
  const cssFiles = new Set(info.css);
  (info.imports || [])
    .flatMap((f) => Array.from(getCssTags(f, manifest, seen)))
    .forEach((f) => cssFiles.add(f));

  return cssFiles;
};

const validateHeadTagExists = (serverHtml: string): void => {
  if (serverHtml.indexOf("</head>") === -1) {
    throw new Error("No head tag is defined _server.tsx");
  }
};

/**
 * Finds the closing </head> tag and injects the input string into it.
 * @param html
 */
const injectIntoHead = (html: string, stringToInject: string): string => {
  const closingHeadIndex = html.indexOf("</head>");
  return (
    html.slice(0, closingHeadIndex) +
    stringToInject +
    html.slice(closingHeadIndex)
  );
};
