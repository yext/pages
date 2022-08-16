import { getLocalDataForEntity } from "./getLocalData.js";
import { TEMPLATE_PATH } from "./constants.js";
import { ViteDevServer } from "vite";
import { generateTestDataForPage } from "./generateTestData.js";
import templateBase from "../public/templateBase";
import { FeaturesConfig } from "../../../common/src/feature/features.js";
import {
  TemplateProps,
  TransformProps,
  GetPath,
  TemplateRenderProps,
} from "../../../common/src/template/types.js";
import { getRelativePrefixToRootFromPath } from "../../../common/src/template/paths.js";
import React from "react";
import { ProjectStructure } from "../../../common/src/project/structure.js";

type PageLoaderValues = {
  url: string;
  vite: ViteDevServer;
  templateFilename: string;
  entityId: string;
  locale: string;
  featuresConfig: FeaturesConfig;
  dynamicGenerateData: boolean;
  projectStructure: ProjectStructure;
};

export type PageLoaderResult = {
  template: string;
  Component: React.FC;
  props: any;
};

type SsrLoadedModule = {
  default: React.FC;
  getPath: GetPath<any>;
  transformProps?: TransformProps<any>;
};

export const pageLoader = async ({
  url,
  vite,
  templateFilename,
  entityId,
  locale,
  featuresConfig,
  dynamicGenerateData,
  projectStructure,
}: PageLoaderValues): Promise<PageLoaderResult> => {
  // 1. Read templateBase.html
  let template = templateBase;

  // 2. Apply vite HTML transforms. This injects the vite HMR client, and
  //    also applies HTML transforms from Vite plugins, e.g. global preambles
  //    from @vitejs/plugin-react-refresh
  template = await vite.transformIndexHtml(url, template);

  // 3. Load the server entry. vite.ssrLoadModule automatically transforms
  //    your ESM source code to be usable in Node.js! There is no bundling
  //    required, and provides efficient invalidation similar to HMR.
  const module = await vite.ssrLoadModule(
    `/${TEMPLATE_PATH}/${templateFilename}`
  );

  if (!module.default) {
    throw Error(
      "Default export missing in template: " +
        `/${TEMPLATE_PATH}/${templateFilename}`
    );
  }

  const {
    default: Component,
    transformProps,
    getPath,
  } = module as SsrLoadedModule;

  let document;
  if (dynamicGenerateData) {
    document = await generateTestDataForPage(
      process.stdout,
      featuresConfig,
      entityId,
      locale,
      projectStructure
    );
    if (document === null) {
      // Fall back to localData
      document = await getLocalDataForEntity(entityId, locale);
    }
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
      `getPath does not return a valid string in template '${TEMPLATE_PATH}/${templateFilename}'`
    );
  }

  const templateRenderProps: TemplateRenderProps = {
    ...templateProps,
    path: path,
    relativePrefixToRoot: getRelativePrefixToRootFromPath(path),
  };

  return { template, Component, props: templateRenderProps };
};
