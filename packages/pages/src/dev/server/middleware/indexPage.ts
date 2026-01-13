import { RequestHandler } from "express-serve-static-core";
import { getLocalDataManifest, LocalDataManifest } from "../ssr/getLocalData.js";
import index from "../public/index.js";
import {
  dynamicModeInfoText,
  localDevUrlInfoText,
  localDevUrlHelpText,
  localModeInfoText,
  noLocalDataErrorText,
  yextLogoWhiteSvg,
  webDevelopmentIconBlackSvg,
  externalLinkSvg,
} from "./constants.js";
import { ViteDevServer } from "vite";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { loadFunctions } from "../../../common/src/function/internal/loader.js";
import { FunctionModuleInternal } from "../../../common/src/function/internal/types.js";
import { parseYextrcContents } from "../../../util/yextrcContents.js";
import { getPartition } from "../../../util/partition.js";
import { getYextUrlForPartition } from "../../../util/url.js";
import path from "node:path";
import { logWarning } from "../../../util/logError.js";
import { getInPlatformPageSetDocuments, PageSetConfig } from "../ssr/inPlatformPageSets.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  useProdURLs: boolean;
  projectStructure: ProjectStructure;
  siteId?: number;
  inPlatformPageSets: PageSetConfig[];
};

export const indexPage =
  ({
    vite,
    dynamicGenerateData,
    useProdURLs,
    projectStructure,
    siteId,
    inPlatformPageSets,
  }: Props): RequestHandler =>
  async (_req, res, next) => {
    try {
      let accountLink = "";
      const { accountId, universe } = parseYextrcContents();
      if (accountId !== undefined && universe !== undefined) {
        const partition = getPartition(Number(accountId));
        const accountUrl = `https://${getYextUrlForPartition(universe, partition)}/s/${accountId}/`;
        accountLink = `
          <span class="link-container">
            <a target="_blank" rel="noopener noreferrer" href="${accountUrl}">
              Yext Account
            </a>
            ${externalLinkSvg}
          </span>
        `;
      }

      const templateFilepaths = getTemplateFilepathsFromProjectStructure(projectStructure);
      const localDataManifest = await getLocalDataManifest(vite, templateFilepaths);

      // Inject the header
      let indexPageHtml = index.replace(
        `<!--header-html-->`,
        `
        <div class="header">
          ${yextLogoWhiteSvg}
          <h1>Pages Development</h1>
          <h4 class="external-links">
            ${accountLink}
            <span class="link-container">
              <a target="_blank" rel="noopener noreferrer" href="https://hitchhikers.yext.com/docs/pages/super-quick-start/">
                Documentation
              </a>
              ${externalLinkSvg}
            </span>
          </h4>
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
      if (localDataManifest.static.size + localDataManifest.entity.size) {
        // If there are any data documents for static pages, render that section.
        if (localDataManifest.static.size) {
          indexPageHtml = indexPageHtml.replace(
            `<!--static-pages-html-->`,
            `<h3>Static Pages</h3>
            ${createStaticPageListItems(localDataManifest, useProdURLs)}`
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
                    ${createEntityPageListItems(localDataManifest, templateName, useProdURLs)}
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

      // If there are any in-platform page sets, render that section.
      if (inPlatformPageSets.length && siteId) {
        indexPageHtml = indexPageHtml.replace(
          `<!--in-platform-pages-html-->`,
          `<h3>In-Platform Page Sets</h3>
          <div class="list">
        ${await inPlatformPageSets.reduce(async (pageSetAccumulator, pageSetConfig) => {
          const documents = await getInPlatformPageSetDocuments(siteId, pageSetConfig.id);
          if (documents?.length) {
            return (
              (await pageSetAccumulator) +
              `<h4>
                ${pageSetConfig.display_name}
                pages [template: ${pageSetConfig.code_template}] (${
                  (documents?.filter((d) => !useProdURLs || d.slug) || []).length
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
                    ${createInPlatformPageSetsItems(documents, pageSetConfig.id, useProdURLs)}
                  </tbody>
                </table>`
            );
          }
          return pageSetAccumulator;
        }, Promise.resolve(""))}
        </div>`
        );
      }

      // projectStructure
      const functionsList = [
        ...(
          await loadFunctions(
            path.join(
              projectStructure.config.rootFolders.source,
              projectStructure.config.subfolders.serverlessFunctions
            ),
            projectStructure
          )
        ).values(),
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

const formatStaticLink = (
  useProdUrls: boolean,
  templateName: string,
  locale: string,
  slug?: string
) => {
  if (useProdUrls) {
    return slug;
  }

  // Default language is en. Only add a query param if not en.
  const localeQuery = locale === "en" ? "" : `?locale=${locale}`;

  return templateName + localeQuery;
};

const createStaticPageListItems = (localDataManifest: LocalDataManifest, useProdURLs: boolean) => {
  return Array.from(localDataManifest.static).reduce(
    (templateAccumulator, [, { featureName, pathToLocalesMap }]) => {
      return (
        templateAccumulator +
        `<h4>${featureName} pages (${pathToLocalesMap.values.length}):</h4>` +
        `<table>
          <thead>
            <tr>
              <td>URL</td>
              <td>Locale</td>
            </tr>
          </thead>
          <tbody>
            ${[...pathToLocalesMap].map(([path, locales]) =>
              locales.map((locale) => {
                const link = formatStaticLink(useProdURLs, featureName, locale, path);

                return `
                  <tr>
                    <td>
                      <a href="/${link}">
                        ${link}
                      </a>
                    </td>
                    <td>${locale}</td>
                  </tr>`;
              })
            )}
          </tbody>
        </table>`
      );
    },
    ""
  );
};

const formatEntityLink = (
  useProdUrls: boolean,
  templateName: string,
  entityId: string,
  locale: string,
  slug?: string
) => {
  if (useProdUrls) {
    return slug;
  }

  // Default language is en. Only add a query param if not en.
  const localeQuery = locale === "en" ? "" : `?locale=${locale}`;

  return `${templateName}/${entityId}${localeQuery}`;
};

const createEntityPageListItems = (
  localDataManifest: LocalDataManifest,
  templateName: string,
  useProdURLs: boolean
) => {
  const { accountId, universe } = parseYextrcContents();
  const partition = getPartition(Number(accountId));
  // Content is knowledge graph
  const formatContentLink = (uid: string) => {
    if (accountId !== undefined && universe !== undefined) {
      return `https://${getYextUrlForPartition(
        universe,
        partition
      )}/s/${accountId}/entity/edit?entityIds=${uid}`;
    }
    return;
  };

  const entities = localDataManifest.entity.get(templateName) || [];
  return entities.reduce((entityAccumulator, { uid, entityId, slug, locale }) => {
    if (useProdURLs && !slug) {
      logWarning(
        `No document.slug found for entityId "${entityId}", no link will be rendered in the index page.`
      );
      return entityAccumulator;
    }

    const link = formatEntityLink(useProdURLs, templateName, entityId, locale, slug);

    return (
      entityAccumulator +
      `<tr>
        <td>
          <a href="/${link}">
            ${link}
           </a>
        </td>
        <td>
          ${
            accountId && universe ? `<a href="${formatContentLink(uid)}">${entityId}</a>` : entityId
          }
        </td>
    </tr>`
    );
  }, "");
};

const createInPlatformPageSetsItems = (
  documents: Record<string, any>[],
  templateName: string,
  useProdURLs: boolean
) => {
  const { accountId, universe } = parseYextrcContents();
  const partition = getPartition(Number(accountId));
  const formatKnowledgeGraphLink = (uid: string) => {
    if (accountId !== undefined && universe !== undefined) {
      return `https://${getYextUrlForPartition(
        universe,
        partition
      )}/s/${accountId}/entity/edit?entityIds=${uid}`;
    }
    return;
  };

  return documents.reduce((entityAccumulator, { uid, id, slug, meta }) => {
    if (useProdURLs && !slug) {
      logWarning(
        `No document.slug found for entityId "${id}", no link will be rendered in the index page.`
      );
      return entityAccumulator;
    }

    const link = formatEntityLink(useProdURLs, templateName, id, meta.locale, slug);

    return (
      entityAccumulator +
      `<tr>
        <td>
          <a href="/${link}">
            ${link}
           </a>
        </td>
        <td>
          ${accountId && universe ? `<a href="${formatKnowledgeGraphLink(uid)}">${id}</a>` : id}
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

const createFunctionsTable = (functionsList: FunctionModuleInternal[], indexPageHtml: string) => {
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
                          ? `<a href="/${func.slug.dev}">
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
