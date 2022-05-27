import { ViteDevServer } from "vite";
import { importFresh } from "./moduleImports.js";
import { TemplateModule } from "../../../../../common/src/template/types.js";

// Load the template file as a module given its filename
export const loadTemplateModule = async (
  devserver: ViteDevServer,
  templateFilename: string,
  templateFilepath: string
): Promise<TemplateModule<any>> => {
  // Cache bust the module so a page refresh gets the updated module data
  // (such as a change to the config's name).
  let templateModule = await importFresh(devserver, templateFilepath);

  return {
    ...templateModule,
    path: templateFilepath,
    filename: templateFilename,
  };
};
