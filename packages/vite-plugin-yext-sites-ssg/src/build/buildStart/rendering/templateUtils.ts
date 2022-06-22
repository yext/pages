import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  TemplateProps,
  Manifest,
  TemplateModule,
} from "../../../../../common/src/template/types.js";
import { reactWrapper } from "./wrapper.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../../../common/src/template/internal/types.js";

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
 * @param props
 */
export const generateResponses = async (
  templateModuleInternal: TemplateModuleInternal<any>,
  props: TemplateProps
): Promise<GeneratedPage> => {
  if (templateModuleInternal.getStaticProps) {
    props = await templateModuleInternal.getStaticProps(props);
  }

  const content = renderHtml(templateModuleInternal, props);

  return {
    content,
    path: templateModuleInternal.getPath(props),
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
  props: TemplateProps
) => {
  const { default: component, render, getHeadConfig } = templateModuleInternal;
  if (!component && !render) {
    throw new Error(
      `Cannot render html from template '${templateModuleInternal.config.name}'. Template is missing render function or default export.`
    );
  }

  if (render) {
    if (getHeadConfig) {
      console.warn(
        `getHeadConfig for template ${templateModuleInternal.config.name} will not be called since a custom render function is defined.`
      );
    }

    return render(props);
  }

  return reactWrapper(
    props,
    templateModuleInternal,
    renderToString(createElement(templateModuleInternal.default, props)),
    // TODO -- allow hydration be configurable.
    true,
    getHeadConfig
  );
};
