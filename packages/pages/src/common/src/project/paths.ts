import pathLib from "node:path";
import { Path } from "./path.js";

/**
 * Resolves a scoped root-level file path.
 */
const getScopedFilePath = (fileName: string, scope?: string): Path => {
  return new Path(pathLib.resolve(scope ?? "", fileName));
};

/**
 * Returns the scoped config.yaml path.
 */
export const getConfigYamlPath = (scope?: string): Path => {
  return getScopedFilePath("config.yaml", scope);
};

/**
 * Returns the scoped vite.config.js path.
 */
export const getViteConfigPath = (scope?: string): Path => {
  return getScopedFilePath("vite.config.js", scope);
};

/**
 * Returns the scoped .template-manifest.json path.
 */
export const getTemplateManifestPath = (scope?: string): Path => {
  return getScopedFilePath(".template-manifest.json", scope);
};
