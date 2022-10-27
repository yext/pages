import { getLocalDataForEntity } from "./getLocalData.js";
import { generateTestDataForPage } from "./generateTestData.js";
import { convertTemplateConfigInternalToFeaturesConfig } from "../../../common/src/feature/features.js";
import {
  TemplateProps,
  TemplateRenderProps,
} from "../../../common/src/template/types.js";
import { getRelativePrefixToRootFromPath } from "../../../common/src/template/paths.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";

type PageLoaderValues = {
  templateModuleInternal: TemplateModuleInternal<any, any>;
  entityId: string;
  locale: string;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export const propsLoader = async ({
  templateModuleInternal,
  entityId,
  locale,
  dynamicGenerateData,
  projectStructure,
}: PageLoaderValues): Promise<TemplateRenderProps> => {
  const { transformProps, getPath } = templateModuleInternal;

  let document;
  if (dynamicGenerateData) {
    const featuresConfig = convertTemplateConfigInternalToFeaturesConfig(
      templateModuleInternal.config
    );

    document = await generateTestDataForPage(
      process.stdout,
      featuresConfig,
      entityId,
      locale,
      projectStructure
    );
  } else {
    // Get the document from localData
    document = await getLocalDataForEntity(entityId, locale);
  }

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

  const path = getPath(templateProps);
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
