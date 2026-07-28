import { ViteDevServer } from "vite";
import { getFileContentHash } from "../../../util/fileContentHash.js";

/**
 * Loads a module path with its content hash as a cache key so changed content is
 * reloaded without creating a new module identity for unchanged content.
 *
 * @param devserver vite's devserver instance
 * @param modulePath the module path to load
 * @returns the loaded module
 */
export async function importFresh<T>(
  devserver: ViteDevServer,
  modulePath: string
): Promise<T> {
  const contentHash = getFileContentHash(modulePath);
  const cacheBustingModulePath = `${modulePath}?update=${contentHash}`;
  return (await devserver.ssrLoadModule(cacheBustingModulePath)) as T;
}
