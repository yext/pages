import { getLocalData } from './getLocalData.js';
import { TEMPLATE_PATH } from './constants.js';
import fs from 'fs';
import path from 'path';
import { ViteDevServer } from 'vite';
import { generateTestData } from './generateTestData.js';

type Props = {
  url: string;
  vite: ViteDevServer;
  templateFilename: string;
  entityId: string;
  featureConfig: any;
  dynamicGenerateData: boolean;
};

type PageLoaderResult = {
  template: string;
  Page: any;
  App: any;
  props: any;
};

export const pageLoader = async ({
  url,
  vite,
  templateFilename,
  entityId,
  featureConfig,
  dynamicGenerateData,
}: Props): Promise<PageLoaderResult> => {
  // 1. Read index.html
  let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');

  // 2. Apply vite HTML transforms. This injects the vite HMR client, and
  //    also applies HTML transforms from Vite plugins, e.g. global preambles
  //    from @vitejs/plugin-react-refresh
  template = await vite.transformIndexHtml(url, template);

  // 3. Load the server entry. vite.ssrLoadModule automatically transforms
  //    your ESM source code to be usable in Node.js! There is no bundling
  //    required, and provides efficient invalidation similar to HMR.
  const [{ default: Page, getStaticProps }, { App }] = await Promise.all([
    vite.ssrLoadModule(`/${TEMPLATE_PATH}/${templateFilename}`),
    vite.ssrLoadModule(`/entry`),
  ]);

  let dataDoc;
  // Don't try to pull stream data if one isn't defined. This is primarily for static pages.
  if (featureConfig.streams) {
    if (dynamicGenerateData) {
      // Call generate-test-data
      dataDoc = await generateTestData(featureConfig, entityId);
    } else {
      // Get the data from localData
      dataDoc = await getLocalData(entityId);
    }
  }

  if (getStaticProps) {
    const staticProps = await getStaticProps();
    dataDoc = {
      ...dataDoc,
      ...staticProps,
    }
  }

  const props = { data: { document: { streamOutput: dataDoc } }, __meta: { mode: 'development' } };

  return { template, Page, props, App };
};
