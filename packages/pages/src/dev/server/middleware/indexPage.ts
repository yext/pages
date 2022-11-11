import { RequestHandler } from "express-serve-static-core";
import {
  getLocalDataManifest,
  LocalDataManifest,
} from "../ssr/getLocalData.js";
import index from "../public/index.js";
import {
  dynamicModeInfoText,
  generateTestDataWarningText,
  localModeInfoText,
  noLocalDataErrorText,
  viteDevServerPort,
} from "./constants.js";

type Props = {
  dynamicGenerateData: boolean;
  displayGenerateTestDataWarning: boolean;
  useProdURLs: boolean;
};

export const indexPage =
  ({
    dynamicGenerateData,
    displayGenerateTestDataWarning,
    useProdURLs,
  }: Props): RequestHandler =>
  async (req, res, next) => {
    try {
      const localDataManifest = await getLocalDataManifest();

      let indexPageHtml = index
        // Inject an informative message depending on if the user is in dynamic mode or not.
        .replace(
          `<!--info-html-->`,
          `<div class="info">
          <i class="fa fa-info-circle"></i>
          ${dynamicGenerateData ? dynamicModeInfoText : localModeInfoText}
        </div>`
        );

      // If there is any localData, display hyperlinks to each page that will be generated
      // from each data document.
      if (localDataManifest.static.length + localDataManifest.entity.size) {
        // If there are any data documents for static pages, render that section.
        if (localDataManifest.static.length) {
          indexPageHtml = indexPageHtml.replace(
            `<!--static-pages-html-->`,
            `<div class="section-title">Static Pages</div>
          <div class="list">
          ${Array.from(localDataManifest.static).reduce(
            (templateAccumulator, templateName) =>
              templateAccumulator +
              `<div class="list-title"> <span class="list-title-templateName">${templateName}</span> Pages (1):</div>
            <ul>
              <li>
                <a href="http://localhost:${viteDevServerPort}/${encodeURIComponent(
                templateName
              )}">
                  ${templateName}
                </a>
              </li>
            </ul>`,
            ""
          )}
          </div>
          `
          );
        }

        // If there are any data documents for entity pages, render that section.
        if (Array.from(localDataManifest.entity.keys()).length) {
          indexPageHtml = indexPageHtml.replace(
            `<!--entity-pages-html-->`,
            `<div class="section-title">Entity Pages</div>
            <div class="list">
          ${Array.from(localDataManifest.entity.keys()).reduce(
            (templateAccumulator, templateName) =>
              templateAccumulator +
              `<div class="list-title">
                    <span class="list-title-templateName">${templateName}</span>
                    Pages (${
                      (localDataManifest.entity.get(templateName) || []).length
                    }):
                  </div>
                  <ul>${createPageLinks(
                    localDataManifest,
                    templateName,
                    useProdURLs
                  )}</ul>`,
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
             ${noLocalDataErrorText}
          </div>`
        );
      }

      if (displayGenerateTestDataWarning) {
        // If there was an issue regenerating the local test data on dev server start, then
        // display a warning message that informs the user. This will only be displayed when
        // in dynamic mode (local test data is not refreshed in local mode).
        indexPageHtml = indexPageHtml.replace(
          `<!--warning-html-->`,
          `<div class="warning">
          <i class="fa fa-warning"></i>
          ${generateTestDataWarningText} 
        </div>`
        );
      }

      // Send the HTML back.
      res.status(200).set({ "Content-Type": "text/html" }).end(indexPageHtml);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };

const createPageLinks = (
  localDataManifest: LocalDataManifest,
  templateName: string,
  useProdURLs: boolean
) => {
  const formatLink = (entityId: string, slug: string) => {
    if (useProdURLs) {
      return `http://localhost:${viteDevServerPort}/${slug}`;
    }

    return `http://localhost:${viteDevServerPort}/${encodeURIComponent(
      templateName
    )}/${entityId}`;
  };

  const entities = localDataManifest.entity.get(templateName) || [];
  return entities.reduce((entityAccumulator, { entityId, slug }) => {
    return (
      entityAccumulator +
      `<li>
      <a href="${formatLink(entityId, slug)}">
        ${entityId}
      </a>
    </li>`
    );
  }, "");
};
