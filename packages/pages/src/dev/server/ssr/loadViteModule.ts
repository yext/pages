import { ViteDevServer } from "vite";
import { importFresh } from "./moduleImports.js";

// Load the file as a module through Vite given its filename
export const loadViteModule = async <T>(
  devserver: ViteDevServer,
  templateFilepath: string
): Promise<T> => {
  // Cache bust the module so a page refresh gets the updated module data
  // (such as a change to the config's name).
  return await importFresh<T>(devserver, templateFilepath);
};
