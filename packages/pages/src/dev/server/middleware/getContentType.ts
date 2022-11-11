import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { lookup } from "mime-types";

/**
 * Returns the content type based on the getPath's extension. Falls back to 'text/html'.
 */
export const getContentType = (
  templateModuleInternal: TemplateModuleInternal<any, any>,
  props: any
) => {
  // TODO: once custom headers are supported at the template level use that instead,
  // with a fallback to the current logic.
  const path = templateModuleInternal.getPath(props);

  return lookup(path) || "text/html";
};
