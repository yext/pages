import { HeadConfig, renderHeadConfigToString } from "./head.js";
import { convertToPosixPath } from "./paths.js";
import { TemplateRenderProps } from "./types.js";

export const relativePrefixToRootReplacementTag = "YEXT_RELATIVEPREFIXTOROOT";

/**
 * Imports the custom hydration template and entrypoint template as modules and calls
 * the render function.
 *
 * Dev has a separate function than {@link getHydrationTemplate} due to how Vite messes
 * with the import.meta.url.
 *
 * Output string is split into two strings. The first part is required for Vite to load in CSS
 * and the second part allows hydration. We want CSS to always load but hydration to be
 * controllable.
 *
 * @param clientRenderTemplatePath the path to the custom client render template
 * @param templateModulePath the path to the template module
 * @param props the {@link TemplateRenderProps}
 * @returns the HTML as a string
 */
export const getHydrationTemplateDev = (
  clientRenderTemplatePath: string,
  templateModulePath: string,
  props: TemplateRenderProps,
  hydrate: boolean
): string => {
  let hydrationTemplate = `
  import {default as Component} from "${convertToPosixPath(
    templateModulePath
  )}";
  `;

  if (hydrate) {
    hydrationTemplate += `
    import {render} from "${convertToPosixPath(clientRenderTemplatePath)}";
    render(
    {
        Page: Component,
        pageProps: ${JSON.stringify(props)},
    }
    );
  `;
  }

  return hydrationTemplate;
};

/**
 * Imports the custom hydration template and entrypoint template as modules and calls
 * the render function.
 *
 * The component paths need to be resolved to the current domain's relative path in order
 * to support reverse proxies.
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
        const componentUrl = import.meta.resolve("./${convertToPosixPath(
          templateModulePath
        )}");
        const renderUrl = import.meta.resolve("./${convertToPosixPath(
          clientRenderTemplatePath
        )}");
        
        const component = await import(componentUrl);
        const render = await import(renderUrl);

        render.render({
            Page: component.default,
            pageProps: ${JSON.stringify(props)},
        });

        <!--INJECT-ASSET-FIX-->
    `;
};

/**
 * Get the server template with injected html common to both the dev and plugin side of things.
 * For the most part, injects data into the <head> tag. It also provides validation.
 *
 * @param clientHydrationString if this is undefined then hydration is skipped
 * @param serverHtml
 * @param appLanguage
 * @param headConfig
 * @returns the server template with injected html
 */
const getCommonInjectedServerHtml = (
  clientHydrationString: string | undefined,
  serverHtml: string,
  appLanguage: string,
  headConfig?: HeadConfig
): string => {
  // Add the language to the <html> tag if it exists
  serverHtml = serverHtml.replace("<!--app-lang-->", appLanguage);

  if (clientHydrationString) {
    serverHtml = injectIntoHead(
      serverHtml,
      `<script type="module">${clientHydrationString}</script>`
    );
  }

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
 * @param clientHydrationString
 * @param serverHtml
 * @param appLanguage
 * @param headConfig
 * @returns the server template to render in the Vite dev environment
 */
export const getServerTemplateDev = (
  clientHydrationString: string | undefined,
  serverHtml: string,
  appLanguage: string,
  headConfig?: HeadConfig
): string => {
  return getCommonInjectedServerHtml(
    clientHydrationString,
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
 * @param clientHydrationString
 * @param serverHtml
 * @param templateFilepath
 * @param bundlerManifest
 * @param relativePrefixToRoot
 * @param appLanguage
 * @param headConfig
 * @returns the server template to render in the Deno plugin execution context when rendering HTML
 */
export const getServerTemplatePlugin = (
  clientHydrationString: string | undefined,
  serverHtml: string,
  templateFilepath: string,
  bundlerManifest: bundlerManifest,
  relativePrefixToRoot: string,
  appLanguage: string,
  headConfig?: HeadConfig
) => {
  let html = getCommonInjectedServerHtml(
    clientHydrationString,
    serverHtml,
    appLanguage,
    headConfig
  );
  html = injectIntoHead(
    html,
    getCssHtml(templateFilepath, bundlerManifest, relativePrefixToRoot)
  );

  // Assets imported in js files need to be relative based on current url's path. We can achieve this by
  // using the relativePrefixToRoot. The replacement tag was added during the Vite build step in
  // packages/pages/src/vite-plugin/build/build.ts.
  html = html.replaceAll(
    relativePrefixToRootReplacementTag,
    relativePrefixToRoot
  );

  if (clientHydrationString) {
    // Similar to above, we need the client hydration code to also make use of relativePrefixToRoot. The server and client
    // code is exactly the same based on what is built, which means that there is a replacement tag that needs to be updated.
    // Since the client side hydration occurs by importing the file directly, we need a way to still hook into the generated
    // code and update the tags with the dynamic relativePrefixToRoot (which is determined by the document props at render time).
    // This is somewhat of a hack that updates the src and href urls in place.
    html = html.replace(
      "<!--INJECT-ASSET-FIX-->",
      `function fixUrls() {
         console.log("updating urls");
         var srcNodeList = document.querySelectorAll('[src],[href]');
         for (var i = 0; i < srcNodeList.length; ++i) {
           var item = srcNodeList[i];
             if (item.getAttribute('src') !== null && item.getAttribute('src').includes('${relativePrefixToRootReplacementTag}')){
                 item.setAttribute('src', item.getAttribute('src').replace("${relativePrefixToRootReplacementTag}", "${relativePrefixToRoot}"));
             }
             if (item.getAttribute('href') !== null && item.getAttribute('href').includes('${relativePrefixToRootReplacementTag}')){
                 item.setAttribute('href', item.getAttribute('href').replace("${relativePrefixToRootReplacementTag}", "${relativePrefixToRoot}"));
             }
         }
       }    

      fixUrls();
      `
    );
  }

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

const headTag = "<head>";

/**
 * Finds the opening <head> tag and injects the input string into it.
 * @param html
 */
const injectIntoHead = (html: string, stringToInject: string): string => {
  let openingHeadIndex = html.indexOf(headTag);

  if (openingHeadIndex === -1) {
    throw new Error("_server.tsx: No head tag is defined");
  }

  openingHeadIndex += headTag.length;

  return (
    html.slice(0, openingHeadIndex) +
    stringToInject +
    html.slice(openingHeadIndex)
  );
};
