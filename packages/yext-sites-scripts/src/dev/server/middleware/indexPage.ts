import { RequestHandler } from "express-serve-static-core";
import { getLocalDataManifest } from "../ssr/getLocalData.js";
import index from "../public/index";
import {
  dynamicModeInfoText,
  generateTestDataWarningText,
  localModeInfoText,
  noLocalDataErrorText,
} from "./constants.js";

type Props = {
  dynamicGenerateData: Boolean;
  displayGenerateTestDataWarning: Boolean;
};

export const indexPage =
  ({
    dynamicGenerateData,
    displayGenerateTestDataWarning,
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
        )
        // If there is localData, inject the lists for each entity in the localData folder.
        // Hyperlinks will be grouped by template. Use reduce instead of map because map will
        // automatically join entries to a string by inserting commas in-between entries. If
        // there is no localData, then display an error message.
        .replace(
          `<!--list-html-->`,
          Array.from(localDataManifest.entries()).length
            ? `<div class="list">
          ${Array.from(localDataManifest.keys()).reduce(
            (templateAccumulator, templateName) =>
              templateAccumulator +
              `<div class="list-title"> <span class="list-title-templateName">${templateName}</span> Pages (${
                (localDataManifest.get(templateName) || []).length
              }):</div>
            <ul>
              ${Array.from(localDataManifest.get(templateName) || []).reduce(
                (entityAccumulator, entityId) =>
                  entityAccumulator +
                  `<li>
                    <a href="http://localhost:3000/${templateName}/${
                    entityId ? entityId : ""
                  }">
                      ${entityId ? entityId : templateName}
                    </a>
                  </li>`,
                ""
              )}
            </ul>`,
            ""
          )}
          </div>`
            : `<div class="error">
            <i class="fa fa-times-circle"></i>
            ${noLocalDataErrorText}
          </div>`
        );

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
