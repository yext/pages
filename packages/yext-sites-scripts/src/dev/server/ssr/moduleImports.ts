import { ViteDevServer } from "vite";
import { TemplateModule } from "../../../../../common/src/template/types";

/**
 * Loads a module path with a cache-busting query param (the date) to ensure the loaded module is
 * always up-to-date.
 *
 * @param devserver vite's devserver instance
 * @param modulePath the module path to load
 * @returns the loaded module
 */
export async function importFresh(
  devserver: ViteDevServer,
  modulePath: string
): Promise<TemplateModule<any>> {
  const cacheBustingModulePath = `${modulePath}?update=${Date.now()}`;
  return (await devserver.ssrLoadModule(
    cacheBustingModulePath
  )) as TemplateModule<any>;
}
