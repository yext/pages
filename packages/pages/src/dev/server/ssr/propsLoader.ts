import {
  TemplateProps,
  TemplateRenderProps,
} from "../../../common/src/template/types.js";
import { getRelativePrefixToRootFromPath } from "../../../common/src/template/paths.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";

type PageLoaderValues = {
  templateModuleInternal: TemplateModuleInternal<any, any>;
  entityId?: string;
  locale: string;
  document: any;
};

export const propsLoader = async ({
  templateModuleInternal,
  entityId,
  locale,
  document,
}: PageLoaderValues): Promise<TemplateRenderProps> => {
  const { transformProps, getPath } = templateModuleInternal;

  if (entityId && !document) {
    throw new Error(
      `Could not find document data for entityId and locale: ${entityId} ${locale}`
    );
  }

  let templateProps: TemplateProps = {
    document: document,
    __meta: { mode: "development" },
  };

  if (transformProps) {
    templateProps = await transformProps(templateProps);
  }

  const path = "subdirectory/" + getPath(templateProps);
  if (!path) {
    throw new Error(
      `getPath does not return a valid string in template '${templateModuleInternal.path}'`
    );
  }

  return {
    ...templateProps,
    path: path,
    relativePrefixToRoot: getRelativePrefixToRootFromPath(path),
  };
};
