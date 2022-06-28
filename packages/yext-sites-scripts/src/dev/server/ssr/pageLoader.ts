import { getLocalDataForEntity } from "./getLocalData.js";
import { TEMPLATE_PATH } from "./constants.js";
import { ViteDevServer } from "vite";
import { generateTestDataForEntity } from "./generateTestData.js";
import templateBase from "../public/templateBase";
import { FeaturesConfig } from "../../../../../common/src/feature/features.js";
import {
  TemplateProps,
  GetStaticProps,
} from "../../../../../common/src/template/types.js";
import React from "react";

type PageLoaderValues = {
  url: string;
  vite: ViteDevServer;
  templateFilename: string;
  entityId: string;
  featuresConfig: FeaturesConfig;
  dynamicGenerateData: boolean;
  feature: string;
};

export type PageLoaderResult = {
  template: string;
  Component: React.FC;
  props: any;
};

type SsrLoadedModule = {
  default: React.FC;
  getStaticProps?: GetStaticProps<any>;
};

export const pageLoader = async ({
  url,
  vite,
  templateFilename,
  entityId,
  featuresConfig,
  dynamicGenerateData,
  feature,
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

  const { default: Component, getStaticProps } = module as SsrLoadedModule;

  let document;
  if (dynamicGenerateData) {
    document = await generateTestDataForEntity(
      process.stdout,
      featuresConfig,
      entityId
    );
  } else {
    // Get the document from localData
    document = await getLocalDataForEntity(entityId);
  }

  if (!document) {
    throw new Error(`Could not find document data for entityId: ${entityId}`);
  }

  let props: TemplateProps = {
    document: document,
    __meta: { mode: "development" },
  };

  if (getStaticProps) {
    props = await getStaticProps(props);
  }

  return { template, Component, props };
};
