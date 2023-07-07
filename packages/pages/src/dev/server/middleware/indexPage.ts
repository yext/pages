import { RequestHandler } from "express-serve-static-core";
import {
  getLocalDataManifest,
  LocalDataManifest,
} from "../ssr/getLocalData.js";
import index from "../public/index.js";
import {
  devServerPort,
  dynamicModeInfoText,
  localDevUrlInfoText,
  localDevUrlHelpText,
  localModeInfoText,
  noLocalDataErrorText,
  yextLogoWhiteSvg,
  webDevelopmentIconBlackSvg,
} from "./constants.js";
import { ViteDevServer } from "vite";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { loadFunctions } from "../../../common/src/function/internal/loader.js";
import { FunctionModuleInternal } from "../../../common/src/function/internal/types.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  useProdURLs: boolean;
  projectStructure: ProjectStructure;
};

export const indexPage =
  ({
    vite,
    dynamicGenerateData,
    useProdURLs,
    projectStructure,
  }: Props): RequestHandler =>
  async (_req, res, next) => {
    try {
      const templateFilepaths =
        getTemplateFilepathsFromProjectStructure(projectStructure);
      const localDataManifest = await getLocalDataManifest(
        vite,
        templateFilepaths
      );

      // Inject the header
      let indexPageHtml = index.replace(
        `<!--header-html-->`,
        `
        <div class="header">
          ${yextLogoWhiteSvg}
          <h1>Pages Development</h1>
        </div>
        `
      );

      // Inject the sidebar
      indexPageHtml = indexPageHtml.replace(
        `<!--sidebar-html-->`,
        `<div class="sidebar">
          ${webDevelopmentIconBlackSvg}
          ${getInfoMessage(dynamicGenerateData, useProdURLs)}
        </div>`
      );

      // If there is any localData, display hyperlinks to each page that will be generated
      // from each data document.
      if (localDataManifest.static.length + localDataManifest.entity.size) {
        // If there are any data documents for static pages, render that section.
        if (localDataManifest.static.length) {
          indexPageHtml = indexPageHtml.replace(
            `<!--static-pages-html-->`,
            `<h3>Static Pages</h3>
            ${createStaticPageListItems(localDataManifest)}`
          );
        }

        // If there are any data documents for entity pages, render that section.
        if (Array.from(localDataManifest.entity.keys()).length) {
          indexPageHtml = indexPageHtml.replace(
            `<!--entity-pages-html-->`,
            `<h3>Entity Pages</h3>
            <div class="list">
          ${Array.from(localDataManifest.entity.keys()).reduce(
            (templateAccumulator, templateName) =>
              templateAccumulator +
              `<h4>
                ${templateName}
                pages (${
                  (
                    localDataManifest.entity
                      .get(templateName)
                      ?.filter((d) => !useProdURLs || d.slug) || []
                  ).length
                }):
              </h4>
                <table>
                  <thead>
                    <tr>
                      <td>URL</td>
                      <td>Entity ID</td>
                    </tr>
                  </thead>
                  <tbody>
                    ${createEntityPageListItems(
                      localDataManifest,
                      templateName,
                      useProdURLs
                    )}
                  </tbody>
                </table>`,
            ""
          )}
          </div>`
          );
        }
      } else {
        // If there are no localData documents, inform the user with an error message.
        indexPageHtml = indexPageHtml.replace(
          `<!--error-html-->`,
          `<div class="error">
           <i class="fa fa-times-circle"></i>
             <p>${noLocalDataErrorText}</p>
          </div>`
        );
      }

      const functionsList = [
        ...(await loadFunctions("src/functions")).values(),
      ];
      indexPageHtml = createFunctionsTable(functionsList, indexPageHtml);

      // Send the HTML back.
      res.status(200).set({ "Content-Type": "text/html" }).end(indexPageHtml);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };

const createStaticPageListItems = (localDataManifest: LocalDataManifest) => {
  return Array.from(localDataManifest.static).reduce(
    (templateAccumulator, { featureName, staticURL }) =>
      templateAccumulator +
      `<h4>${featureName} pages (1):</h4>
      <table>
        <thead>
          <tr>
            <td>URL</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a href="http://localhost:${devServerPort}/${encodeURIComponent(
        staticURL
      )}">
                ${staticURL}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
`,
    ""
  );
};

const createEntityPageListItems = (
  localDataManifest: LocalDataManifest,
  templateName: string,
  useProdURLs: boolean
) => {
  const formatLink = (entityId: string, slug: string | undefined) => {
    if (useProdURLs) {
      return `http://localhost:${devServerPort}/${slug}`;
    }

    return `http://localhost:${devServerPort}/${encodeURIComponent(
      templateName
    )}/${entityId}`;
  };

  const formatDisplayValue = (entityId: string, slug: string | undefined) => {
    if (!slug) {
      return entityId;
    }
    return `${slug}`;
  };

  const entities = localDataManifest.entity.get(templateName) || [];
  return entities.reduce((entityAccumulator, { entityId, slug }) => {
    if (useProdURLs && !slug) {
      console.error(
        `No document.slug found for entityId "${entityId}", no link will be rendered in the index page.`
      );
      return entityAccumulator;
    }
    return (
      entityAccumulator +
      `<tr>
        <td>
          <a href="${formatLink(entityId, slug)}">
            ${formatDisplayValue(entityId, slug)}
           </a>
        </td>
        <td>
          ${entityId}
        </td>
    </tr>`
    );
  }, "");
};

const getInfoMessage = (isDynamic: boolean, isProdUrl: boolean): string => {
  if (isDynamic && isProdUrl) {
    return `<ul>
        <li>${dynamicModeInfoText}</li>
        <li>${localDevUrlInfoText}</li>
        <li>${localDevUrlHelpText}</li>
      <ul>`;
  }

  if (isDynamic) {
    return dynamicModeInfoText;
  }

  return `<p>${localModeInfoText}</p>`;
};

const createFunctionsTable = (
  functionsList: FunctionModuleInternal[],
  indexPageHtml: string
) => {
  if (functionsList.length > 0) {
    return indexPageHtml.replace(
      "<!--functions-html-->",
      `
          <h3>Functions</h3>
          <table>
            <thead>
              <tr>
                <td>URL</td>
                 <td>Function Type</td>
              </tr>
            </thead>
            <tbody>
              ${functionsList.reduce((previous, func) => {
                return (
                  previous +
                  `
                  <tr>
                    <td>
                      ${
                        func.config.event === "API"
                          ? `<a href="http://localhost:${devServerPort}/${func.slug.dev}">
                          ${func.slug.original}                 
                        </a>`
                          : func.slug.dev
                      }
                    </td>
                    <td>
                      ${func.config.event}
                    </td>
                  </tr>
                `
                );
              }, "")}
            </tbody>
          </table>
        `
    );
  }
  return indexPageHtml;
};
