// Environment: server

import ReactDOMServer from "react-dom/server";
import React from "react";
import { PageContext, TemplateRenderProps } from "../types.js";

export { render };

const render = async (pageContext: PageContext<TemplateRenderProps>) => {
  const { Page, pageProps } = pageContext;
  const viewHtml = ReactDOMServer.renderToString(<Page {...pageProps} />);

  const title = pageProps.document.name;

  return `<!DOCTYPE html>
    <html lang="<!--app-lang-->">
      <head><!--app-head--></head>
      <body>
        <div id="reactele">${viewHtml}</div>
      </body>
    </html>`;
};

// const html = `<!DOCTYPE html>
//     <html lang=${lang}>
//     <head>
//         <script>window.__INITIAL__DATA__ = ${JSON.stringify(props)}</script>
//         ${Array.from(
//           getCssTags(
//             templateFilepath,
//             props.__meta.manifest.bundlerManifest,
//             new Set()
//           )
//         )
//           .map(
//             (f) =>
//               `<link rel="stylesheet" href="${
//                 props.relativePrefixToRoot + f
//               }"/>`
//           )
//           .join("\n")}
//         ${headConfig ? renderHeadConfigToString(headConfig) : ""}
//         <!--emotion-css-->
//     </head>
//     <body>
//         <div id="reactele">${template}</div>${
//     hydrate
//       ? `<script type="module" src="${
//           props.relativePrefixToRoot +
//           findHydrationFilename(
//             `${projectFilepaths.hydrationBundleOutputRoot}/${templateModuleInternal.templateName}.tsx`,
//             props
//           )
//         }" defer></script>`
//       : ""
//   }
//     </body>
//     </html>`;

//     const html = template
//     .replace(`<!--app-html-->`, appHtml)
//     .replace(
//       `<!--app-head-->`,
//       `<head>
//         <!--emotion-css-->
//         <script type="text/javascript">
//           window._RSS_PROPS_ = ${JSON.stringify(props)};
//           window._RSS_TEMPLATE_PATH_ = '${templateModuleInternal.path}';
//           window._RSS_LANG_ = '${getLang(headConfig, props)}';
//         </script>
//         ${headConfig ? renderHeadConfigToString(headConfig) : ""}
//       </head>`
//     );
