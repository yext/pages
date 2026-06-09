import { existsSync } from "node:fs";
import pathLib from "node:path";
import { Path } from "./path.js";

type PathOptions = { fallbackToRoot?: boolean };

/**
 * Resolves a scoped root-level file path and optionally falls back to the root
 * file when the scoped file does not exist.
 */
const getRootFilePath = (fileName: string, scope?: string, options?: PathOptions): Path => {
  const scopedPath = new Path(pathLib.resolve(scope ?? "", fileName));
  if (scope && options?.fallbackToRoot && !existsSync(scopedPath.getAbsolutePath())) {
    return new Path(pathLib.resolve(fileName));
  }

  return scopedPath;
};

/**
 * Returns the scoped config.yaml path.
 */
export const getConfigYamlPath = (scope?: string, options?: PathOptions): Path => {
  return getRootFilePath("config.yaml", scope, options);
};

/**
 * Returns the scoped vite.config.js path.
 */
export const getViteConfigPath = (scope?: string, options?: PathOptions): Path => {
  return getRootFilePath("vite.config.js", scope, options);
};

/**
 * Returns the scoped .template-manifest.json path.
 */
export const getTemplateManifestPath = (scope?: string, options?: PathOptions): Path => {
  return getRootFilePath(".template-manifest.json", scope, options);
};
