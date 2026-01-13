import { TemplateProps, TemplateRenderProps } from "../../../common/src/template/types.js";
import { getRelativePrefixToRootFromPath } from "../../../common/src/template/paths.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";
import { validateGetPathValue } from "../../../common/src/template/internal/validateGetPathValue.js";

type PageLoaderValues = {
  templateModuleInternal: TemplateModuleInternal<any, any>;
  document: any;
};

export const propsLoader = async ({
  templateModuleInternal,
  document,
}: PageLoaderValues): Promise<TemplateRenderProps> => {
  const { transformProps, getPath, getAuthScope } = templateModuleInternal;

  document.siteInternalHostName = process.env.YEXT_PAGES_SCOPE;

  let templateProps: TemplateProps = {
    document: document,
    __meta: { mode: "development" },
  };

  if (transformProps) {
    templateProps = await transformProps(templateProps);
  }

  if (getAuthScope) {
    // Not used in dev but executed so errors are caught
    getAuthScope(templateProps);
  }

  const path = getPath(templateProps);
  validateGetPathValue(path, templateModuleInternal.path);

  return {
    ...templateProps,
    path: path,
    relativePrefixToRoot: getRelativePrefixToRootFromPath(path),
  };
};
