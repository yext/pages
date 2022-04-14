import path from 'path';
import { ViteDevServer } from 'vite';
import { TEMPLATE_PATH } from './constants.js';
import { importFresh } from './moduleImports.js';

// Gets the templates's config for use in generate-test-data
export const getTemplateConfig = async (devserver: ViteDevServer, templateFilename: string): Promise<any> => {
  const filepath = path.resolve(process.cwd(), `${TEMPLATE_PATH}/${templateFilename}`);

  // Cache bust the module so a page refresh gets the updated module data
  // (such as a change to the config's name).
  const component = await importFresh(devserver, filepath);

  if (component.config) {
    return component.config;
  }
};
