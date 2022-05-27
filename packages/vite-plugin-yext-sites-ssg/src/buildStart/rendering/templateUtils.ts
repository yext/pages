import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { reactWrapper } from "./wrapper";

const pathToModule = new Map();

type Manifest = {
  // A map of feature name to the bundle path of the feature.
  bundlePaths: {
    [key: string]: string;
  };
  // If the bundler used generates a manifest.json then this field will contain that json object.
  bundlerManifest?: any;
};

/**
 * @returns an array of template modules matching the document's feature.
 */
export const readTemplateModules = async (
  feature: string,
  manifest: Manifest
): Promise<TemplateModule> => {
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

export type Document = {
  feature: string;
  streamOutput: any;
};

export type Data = {
  document: Document;
  __meta: any;
};

type TemplateModule = {
  config: {
    name: string;
    streamId: string;
  };
  getPath: (data: any) => string;
  render: (data: any) => string;
  getStaticProps?: (document: any) => Promise<any>;
  /**
   * A template module will have a default export if it is a react template. In this case, the
   * default export will be the component class or function to render.
   */
  default?: any;
};

/**
 * Takes an array of template modules info and stream documents, processes them, and
 * writes them to disk.
 * @param modules an array of TemplateModules
 * @param data
 */
export const generateResponses = async (
  mod: TemplateModule,
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
const renderHtml = (mod: TemplateModule, data: Data) => {
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
    `${mod.config.name}.tsx`,
    renderToString(createElement(mod.default, data)),
    // TODO -- allow hydration be configurable.
    true
  );
};
