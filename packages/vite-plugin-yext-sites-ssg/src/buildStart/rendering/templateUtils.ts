import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  Data,
  Manifest,
  TemplateModule,
} from "../../../../common/src/template/types";
import { reactWrapper } from "./wrapper";

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

    validateModule(importedModule);
    pathToModule.set(path, importedModule);
  }

  return importedModule;
};

// an unvalidated template module.
type MaybeTemplateModule = any;

const validateModule = (mod: MaybeTemplateModule) => {
  if (!mod.config || !mod.getPath) {
    throw new Error(
      "Module does not conform to the expected template interface. Module needs " +
        "'config' and 'getPath' exports."
    );
  }

  if (!mod.default && !mod.render) {
    throw new Error(
      "Module does not have the necessary exports to produce page. A module should" +
        "either have a React component as a default export or a render function."
    );
  }
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
 * @param templateModule
 * @param data
 */
export const generateResponses = async (
  templateModule: TemplateModule<any>,
  data: Data
): Promise<GeneratedPage> => {
  if (templateModule.getStaticProps) {
    data = await templateModule.getStaticProps(data);
  }

  const content = renderHtml(templateModule, data);

  return {
    content,
    path: templateModule.getPath(data),
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
const renderHtml = (templateModule: TemplateModule<any>, data: Data) => {
  const { default: component, render } = templateModule;
  if (!component && !render) {
    throw new Error(
      `Cannot render html from template '${templateModule.config.name}'. Template is missing render function or default export.`
    );
  }

  if (render) {
    return render(data);
  }

  return reactWrapper(
    data,
    templateModule,
    renderToString(createElement(templateModule.default, data)),
    // TODO -- allow hydration be configurable.
    true
  );
};
