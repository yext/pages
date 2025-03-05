import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { propsLoader } from "../ssr/propsLoader.js";
import {
  parseAsStaticUrl,
  parseAsEntityUrl,
  getLocaleFromUrl,
} from "../ssr/parseNonProdUrl.js";
import { findTemplateModuleInternalByName } from "../ssr/findTemplateModuleInternal.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import sendAppHTML from "./sendAppHTML.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import { generateTestDataForPage } from "../ssr/generateTestData.js";
import { entityPageCriterion, getLocalData } from "../ssr/getLocalData.js";
import send404 from "./send404.js";
import { findStaticTemplateModuleAndDocBySlug } from "../ssr/findMatchingStaticTemplate.js";
import { VisualEditorPreviewOverrides } from "./types.js";

type Props = {
  vite: ViteDevServer;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export const serverRenderRoute =
  ({ vite, dynamicGenerateData, projectStructure }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const url = new URL("http://" + req.headers.host + req.originalUrl);
      const templateFilepaths =
        getTemplateFilepathsFromProjectStructure(projectStructure);
      const { staticURL } = parseAsStaticUrl(url);

      const visualEditorOverrides = req?.body?.overrides
        ? (JSON.parse(req?.body?.overrides) as VisualEditorPreviewOverrides)
        : undefined;

      let entityId, feature, locale;
      if (visualEditorOverrides) {
        feature = visualEditorOverrides.pageSet.codeTemplate;
        entityId = visualEditorOverrides.entityId;
        locale = visualEditorOverrides.locale;
      } else {
        ({ entityId, feature } = parseAsEntityUrl(url));
        locale = getLocaleFromUrl(url) ?? "en";
      }

      if (!visualEditorOverrides) {
        const staticTemplateAndProps =
          await findStaticTemplateModuleAndDocBySlug(
            vite,
            templateFilepaths,
            false,
            staticURL,
            locale
          );
        if (staticTemplateAndProps) {
          await sendAppHTML(
            res,
            staticTemplateAndProps.staticTemplateModuleInternal,
            staticTemplateAndProps.props,
            vite,
            req.originalUrl,
            projectStructure
          );
          return;
        }
      }

      if (!entityId || !feature) {
        send404(res, `Cannot find template with URL "${url}"`);
        return;
      }

      const templateModuleInternal = await findTemplateModuleInternalByName(
        vite,
        feature,
        templateFilepaths,
        !!visualEditorOverrides
      );
      if (!templateModuleInternal) {
        send404(
          res,
          `Cannot find template corresponding to feature: ${feature}`
        );
        return;
      }

      if (visualEditorOverrides) {
        templateModuleInternal.config = {
          templateType: "entity",
          hydrate: true,
          name: visualEditorOverrides.pageSet.id,
          stream: {
            $id: visualEditorOverrides.pageSet.id,
            filter: {
              entityTypes: visualEditorOverrides.pageSet.scope.entityTypes
                .length
                ? visualEditorOverrides.pageSet.scope.entityTypes.map(
                    (scopeItem) => scopeItem.name
                  )
                : undefined,
              savedFilterIds: visualEditorOverrides.pageSet.scope.savedFilters
                .length
                ? visualEditorOverrides.pageSet.scope.savedFilters.map(
                    (scopeItem) => scopeItem.externalId
                  )
                : undefined,
            },
            localization: {
              locales: visualEditorOverrides.pageSet.scope.locales,
              primary: false,
            },
            fields: [],
          },
        };
      }

      const document = await getDocument(
        dynamicGenerateData,
        templateModuleInternal,
        entityId,
        locale,
        projectStructure,
        visualEditorOverrides
      );
      if (!document) {
        send404(
          res,
          `Cannot find document document data for entityId and locale: ${entityId} ${locale}`
        );
        return;
      }

      if (visualEditorOverrides) {
        document.__.theme = visualEditorOverrides.theme ?? "{}";
        document.__.layout =
          visualEditorOverrides.layout ??
          '{"root": {}, "zones": {}, "content": []}';
      }

      const props = await propsLoader({
        templateModuleInternal,
        document,
      });
      await sendAppHTML(
        res,
        templateModuleInternal,
        props,
        vite,
        req.originalUrl,
        projectStructure
      );
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };

const getDocument = async (
  dynamicGenerateData: boolean,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  entityId: string,
  locale: string,
  projectStructure: ProjectStructure,
  visualEditorOverrides?: VisualEditorPreviewOverrides
) => {
  if (visualEditorOverrides?.pageSet || dynamicGenerateData) {
    const featuresConfig = convertTemplateConfigInternalToFeaturesConfig(
      templateModuleInternal.config
    );

    return generateTestDataForPage(
      process.stdout,
      featuresConfig,
      entityId,
      locale,
      projectStructure,
      visualEditorOverrides
    );
  }

  return (
    await getLocalData(
      entityPageCriterion(entityId, templateModuleInternal.config.name, locale)
    )
  )?.document;
};
