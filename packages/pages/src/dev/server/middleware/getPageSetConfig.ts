import { VisualEditorPreviewOverrides } from "./types.js";
import { TemplateConfigInternal } from "../../../common/src/template/internal/types.js";

export const getPageSetConfig = (
  visualEditorOverrides: VisualEditorPreviewOverrides
): TemplateConfigInternal => {
  return {
    templateType: "entity",
    hydrate: true,
    name: visualEditorOverrides.pageSet.id,
    stream: {
      $id: visualEditorOverrides.pageSet.id,
      filter: {
        entityTypes: visualEditorOverrides.pageSet.scope.entityTypes.length
          ? visualEditorOverrides.pageSet.scope.entityTypes.map(
              (scopeItem) => scopeItem.name
            )
          : undefined,
        savedFilterIds:
          visualEditorOverrides.pageSet.scope.savedFilters.map(
            (scopeItem) => scopeItem.externalId
          ) ?? undefined,
      },
      localization: {
        locales: visualEditorOverrides.pageSet.scope.locales,
        primary: false,
      },
      fields: [],
    },
  };
};
