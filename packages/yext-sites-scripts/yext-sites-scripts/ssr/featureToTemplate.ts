import path from 'path';
import { TEMPLATE_PATH } from './constants.js';
import { readdir } from 'fs/promises';
import { importFresh } from './moduleImports.js';
import { ViteDevServer } from 'vite';

// Determines the template file of a given feature (from the exported config)
export const featureToTemplate = async (devserver: ViteDevServer, feature: string): Promise<string | null> => {
  const dir = await readdir(`./${TEMPLATE_PATH}`);
  let templateFilename = null;
  for (const fileName of dir) {
    const filepath = path.resolve(process.cwd(), `${TEMPLATE_PATH}/${fileName}`);

    // Cache bust the module so a page refresh gets the updated module data
    // (such as a change to the config's name).
    const component = await importFresh(devserver, filepath);

    if (feature === component.config?.name?.replace(/\s/g, '').toLowerCase()) {
      templateFilename = fileName;
      break;
    }
  }

  return templateFilename;
};
