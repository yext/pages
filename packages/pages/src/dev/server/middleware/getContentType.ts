import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { lookup } from "mime-types";
import { TemplateRenderProps } from "../../../common/src/template/types.js";

/**
 * Returns the content type based on the getPath's extension. Falls back to 'text/html'.
 */
export const getContentType = (
  templateModuleInternal: TemplateModuleInternal<any, any>,
  props: TemplateRenderProps
) => {
  // TODO: once custom headers are supported at the template level use that instead,
  // with a fallback to the current logic.
  const path = templateModuleInternal.getPath(props);

  // There is a bug in mime-types where "map" returns "application/json" instead of false
  // https://github.com/jshttp/mime-types/issues/125
  // Instead, only get the mime type if there's an extension, otherwise fallback to "text/html"
  const pathExtention = path.includes(".") ? path.split(".").pop() : "";

  return pathExtention ? lookup(pathExtention) || "text/html" : "text/html";
};
