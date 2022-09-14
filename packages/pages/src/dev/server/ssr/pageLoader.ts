import { getLocalDataForEntity } from "./getLocalData.js";
import { TEMPLATE_PATH } from "./constants.js";
import { ViteDevServer } from "vite";
import { generateTestDataForPage } from "./generateTestData.js";
import templateBase from "../public/templateBase.js";
import { FeaturesConfig } from "../../../common/src/feature/features.js";
import {
  TemplateProps,
  TemplateRenderProps,
  Render,
} from "../../../common/src/template/types.js";
import { getRelativePrefixToRootFromPath } from "../../../common/src/template/paths.js";
import React from "react";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { TemplateModuleInternal } from "../../../common/src/template/internal/types.js";

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
  Component: React.FC | undefined;
  render: Render<any> | undefined;
  props: any;
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
  const module = (await vite.ssrLoadModule(
    `/${TEMPLATE_PATH}/${templateFilename}`
  )) as TemplateModuleInternal<any, any>;

  if (!module.default && !module.render) {
    throw Error(
      "Either a default export or render function is required in template: " +
        `/${TEMPLATE_PATH}/${templateFilename}`
    );
  }

  const { default: Component, render, transformProps, getPath } = module;

  let document;
  if (dynamicGenerateData) {
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
      `getPath does not return a valid string in template '${TEMPLATE_PATH}/${templateFilename}'`
    );
  }

  const templateRenderProps: TemplateRenderProps = {
    ...templateProps,
    path: path,
    relativePrefixToRoot: getRelativePrefixToRootFromPath(path),
  };

  return { template, Component, render, props: templateRenderProps };
};
