import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  Data,
  Manifest,
  TemplateModule,
} from "../../../../common/src/template/types";
import { reactWrapper } from "./wrapper";
import { validateTemplateModule } from "../../../../common/src/template/validateTemplateModule";

const pathToModule = new Map();

/**
 * @returns an array of template modules matching the document's feature.
 */
export const readTemplateModules = async (
  feature: string,
  manifest: Manifest
): Promise<TemplateModule<any>> => {
  const path = manifest.bundlePaths[feature].replace("assets", "..");
  if (!path) {
    throw new Error(`Could not find path for feature ${feature}`);
  }
  let importedModule = pathToModule.get(path);
  if (!importedModule) {
    importedModule = await import(path);

    validateTemplateModule(importedModule);
    pathToModule.set(path, importedModule);
  }

  return importedModule;
};

// Represents a page produced by the generation procees.
export type GeneratedPage = {
  path: string;
  content: string;
  redirects: string[];
};

/**
 * Takes an array of template modules info and stream documents, processes them, and
 * writes them to disk.
 * @param modules an array of TemplateModules
 * @param data
 */
export const generateResponses = async (
  mod: TemplateModule<any>,
  data: Data
): Promise<GeneratedPage> => {
  if (mod.getStaticProps) {
    data = await mod.getStaticProps(data);
  }

  const content = renderHtml(mod, data);

  return {
    content,
    path: mod.getPath(data),
    redirects: [],
  };
};

/**
 * Checks the render and default export of a module and determines which to use to render html
 * content. The determination is made with the following rules:
 * 1. If module exports a default export and a render function, use the render function
 * 2. If a module exports a default export or a render function, use whatever is exported
 * 3. If a module doesn't export either, throw an error.
 */
const renderHtml = (mod: TemplateModule<any>, data: Data) => {
  const { default: component, render } = mod;
  if (!component && !render) {
    throw new Error(
      `Cannot render html from template '${mod.config.name}'. Template is missing render function or default export.`
    );
  }

  if (render) {
    return render(data);
  }

  return reactWrapper(
    data,
    // TODO read the filename directly from manifest.
    `${mod.config.name}`,
    renderToString(createElement(mod.default, data)),
    // TODO -- allow hydration be configurable.
    true
  );
};
