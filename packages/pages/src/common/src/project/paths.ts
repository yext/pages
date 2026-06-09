import pathLib from "node:path";
import { Path } from "./path.js";

/**
 * Returns the scoped config.yaml path.
 */
export const getConfigYamlPath = (scope?: string): Path => {
  return new Path(pathLib.resolve(scope ?? "", "config.yaml"));
};

/**
 * Returns the scoped vite.config.js path.
 */
export const getViteConfigPath = (scope?: string): Path => {
  return new Path(pathLib.resolve(scope ?? "", "vite.config.js"));
};

/**
 * Returns the scoped .template-manifest.json path.
 */
export const getTemplateManifestPath = (scope?: string): Path => {
  return new Path(pathLib.resolve(scope ?? "", ".template-manifest.json"));
};
