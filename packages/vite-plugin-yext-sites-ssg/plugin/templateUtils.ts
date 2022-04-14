import { Manifest } from "./manifest.ts";

const pathToModule = new Map();

/**
 * @returns an array of template modules matching the document's feature.
 */
export const readTemplateModules = async (
  feature: string,
  manifest: Manifest,
): Promise<TemplateModule[]> => {
  const modules = [] as TemplateModule[];
  const path = manifest.bundlePaths[feature];
  if (!path) {
    throw new Error(`Could not find path for feature ${feature}`);
  }
  let importedModule = pathToModule.get(path);
  if (!importedModule) {
    importedModule = await import(path);
    const { config, getPath, render } = importedModule;
    if (!config || !getPath || !render) {
      console.error(path, importedModule);
      return;
    }
    pathToModule.set(path, importedModule);
  }
  modules.push(importedModule as TemplateModule);

  return modules;
};

// Represents a page produced by the generation procees.
export type GeneratedPage = {
  path: string;
  content: string;
  redirects: string[];
};

export type Document = {
  feature: string;
  streamOutput: any;
};

type Data = {
  document: Document,
  __meta: any,
}

type TemplateModule = {
  config: {
    name: string;
    streamId: string;
  };
  getPath: (data: any) => string;
  render: (data: any) => string;
};

/**
 * Takes an array of template modules info and stream documents, processes them, and
 * writes them to disk.
 * @param modules an array of TemplateModules
 * @param data
 */
export const generateResponses = async (
  modules: TemplateModule[],
  data: Data
): Promise<GeneratedPage> => {
  const {document} = data;
  const featureToValidTemplateModule = new Map<string, TemplateModule>();
  for (const mod of modules) {
    const { config, getPath, render } = mod;
    if (!config || !getPath || !render) {
      console.error("Issue with the imported module ", mod);
      continue;
    }
    featureToValidTemplateModule.set(config.name, mod);
  }

  const feature = document.feature;
  const validModule = featureToValidTemplateModule.get(feature);
  if (!validModule) {
    throw new Error(`could not find module for feature ${feature}`);
  }

  return {
    content: validModule.render(data),
    path: validModule.getPath(data),
    redirects: [],
  };
};
