import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  Data,
  Manifest,
  TemplateModule,
} from "../../../../common/src/template/types";
import { reactWrapper } from "./wrapper";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../../common/src/template/internal/types";

const pathToModule = new Map();

/**
 * @returns an array of template modules matching the document's feature.
 */
export const readTemplateModules = async (
  feature: string,
  manifest: Manifest
): Promise<TemplateModuleInternal<any>> => {
  const path = manifest.bundlePaths[feature].replace("assets", "..");
  if (!path) {
    throw new Error(`Could not find path for feature ${feature}`);
  }
  let importedModule = pathToModule.get(path) as TemplateModule<any>;
  if (!importedModule) {
    importedModule = await import(path);
  }

  const templateModuleInternal = convertTemplateModuleToTemplateModuleInternal(
    path,
    importedModule,
    true
  );

  pathToModule.set(path, templateModuleInternal);

  return templateModuleInternal;
};

// Represents a page produced by the generation procees.
export type GeneratedPage = {
  path: string;
  content: string;
  redirects: string[];
};

/**
 * Takes in both a template module and its stream document, processes them, and writes them to disk.
 *
 * @param templateModuleInternal
 * @param data
 */
export const generateResponses = async (
  templateModuleInternal: TemplateModuleInternal<any>,
  data: Data
): Promise<GeneratedPage> => {
  if (templateModuleInternal.getStaticProps) {
    data = await templateModuleInternal.getStaticProps(data);
  }

  const content = renderHtml(templateModuleInternal, data);

  return {
    content,
    path: templateModuleInternal.getPath(data),
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
const renderHtml = (
  templateModuleInternal: TemplateModuleInternal<any>,
  data: Data
) => {
  const { default: component, render } = templateModuleInternal;
  if (!component && !render) {
    throw new Error(
      `Cannot render html from template '${templateModuleInternal.config.name}'. Template is missing render function or default export.`
    );
  }

  if (render) {
    return render(data);
  }

  return reactWrapper(
    data,
    templateModuleInternal,
    renderToString(createElement(templateModuleInternal.default, data)),
    // TODO -- allow hydration be configurable.
    true
  );
};
