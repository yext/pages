import path from "path";
import { ViteDevServer } from "vite";
import { TEMPLATE_PATH } from "./constants.js";
import { importFresh } from "./moduleImports.js";
import {
  TemplateModule,
  Config,
} from "../../../../../common/templateModule/types.js";

// Load the template file as a module given its filename
export const loadTemplateModule = async (
  devserver: ViteDevServer,
  templateFilename: string
): Promise<TemplateModule> => {
  const filepath = path.resolve(
    process.cwd(),
    `${TEMPLATE_PATH}/${templateFilename}`
  );

  // Cache bust the module so a page refresh gets the updated module data
  // (such as a change to the config's name).
  let templateModule = (await importFresh(
    devserver,
    filepath
  )) as TemplateModule;

  return {
    ...templateModule,
    path: filepath,
    filename: templateFilename,
  };
};
