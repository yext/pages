import { getLocalData } from "./getLocalData.js";
import { TEMPLATE_PATH } from "./constants.js";
import { ViteDevServer } from "vite";
import { generateTestData } from "./generateTestData.js";
import index from "../public/index";
import { CogFeatureConfig } from "../../../../../common/feature/cogFeature.js";
import {
  Data,
  TemplateModule,
} from "../../../../../common/templateModule/types.js";

type Props = {
  url: string;
  vite: ViteDevServer;
  templateFilename: string;
  entityId: string;
  cogFeatureConfig: CogFeatureConfig | null;
  dynamicGenerateData: boolean;
};

export type PageLoaderResult = {
  template: string;
  Component: React.FC;
  props: any;
};

export const pageLoader = async ({
  url,
  vite,
  templateFilename,
  entityId,
  cogFeatureConfig,
  dynamicGenerateData,
}: Props): Promise<PageLoaderResult> => {
  // 1. Read index.html
  let template = index;

  // 2. Apply vite HTML transforms. This injects the vite HMR client, and
  //    also applies HTML transforms from Vite plugins, e.g. global preambles
  //    from @vitejs/plugin-react-refresh
  template = await vite.transformIndexHtml(url, template);

  // 3. Load the server entry. vite.ssrLoadModule automatically transforms
  //    your ESM source code to be usable in Node.js! There is no bundling
  //    required, and provides efficient invalidation similar to HMR.
  const { default: Component, getStaticProps } = <
    { default: any; getStaticProps: TemplateModule<any>["getStaticProps"] }
  >await vite.ssrLoadModule(`/${TEMPLATE_PATH}/${templateFilename}`);

  if (!Component) {
    throw Error(
      "Default export missing in template: " +
        `/${TEMPLATE_PATH}/${templateFilename}`
    );
  }

  let streamOutput;
  // Don't try to pull stream data if one isn't defined. This is primarily for static pages.
  if (cogFeatureConfig?.streams) {
    if (dynamicGenerateData) {
      streamOutput = await generateTestData(
        process.stdout,
        cogFeatureConfig,
        entityId
      );
    } else {
      // Get the data from localData
      streamOutput = await getLocalData(entityId);
    }

    if (!streamOutput) {
      throw new Error(`Could not find document data for entityId: ${entityId}`);
    }
  }

  let props: Data = {
    document: { streamOutput },
    __meta: { mode: "development" },
  };
  if (getStaticProps) {
    props = await getStaticProps(props);
  }

  return { template, Component, props };
};
