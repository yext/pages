import {
  Manifest,
  ServerRenderTemplate,
  TemplateModule,
  TemplateProps,
  TemplateRenderProps,
} from "../../../../common/src/template/types.js";
import { getRelativePrefixToRootFromPath } from "../../../../common/src/template/paths.js";
import { reactWrapper } from "./wrapper.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../../common/src/template/internal/types.js";
import { RedirectSource } from "../../../../common/src/redirect/types.js";
import { ProjectStructure } from "../../../../common/src/project/structure.js";
import { validateGetPathValue } from "../../../../common/src/template/internal/validateGetPathValue.js";

const pathToModule = new Map<string, TemplateModule<any, any>>();

/**
 * @returns an array of template modules matching the document's feature.
 */
export const readTemplateModules = async (
  feature: string,
  manifest: Manifest,
  projectStructure: ProjectStructure
): Promise<TemplateModuleInternal<any, any> | undefined> => {
  if (!manifest.serverPaths[feature]) {
    return;
  }

  const path = manifest.serverPaths[feature].replace(
    projectStructure.config.subfolders.assets,
    ".."
  );
  let importedModule = pathToModule.get(path) as TemplateModule<any, any>;
  if (!importedModule) {
    importedModule = await import(path);
    pathToModule.set(path, importedModule);
  }

  return convertTemplateModuleToTemplateModuleInternal(
    path,
    importedModule,
    true
  );
};

/** The render template information needed by the plugin execution */
export interface PluginRenderTemplates {
  /** The server render module */
  server: ServerRenderTemplate;
  /** The client render relative path */
  client: string;
}

/**
 * Creates a {@link PluginRenderTemplates} based on the {@link Manifest}'s renderPaths.
 * @param manifest
 * @returns
 */
export const getPluginRenderTemplates = async (
  manifest: Manifest,
  projectStructure: ProjectStructure
): Promise<PluginRenderTemplates> => {
  const serverRenderPath = manifest.renderPaths._server.replace(
    projectStructure.config.subfolders.assets,
    ".."
  );

  const serverRenderTemplateModule =
    await importRenderTemplate(serverRenderPath);

  return {
    server: serverRenderTemplateModule,
    client: manifest.renderPaths._client,
  };
};

// caches dynamically imported plugin render template modules. Without this, dynamically imported
// modules will leak some memory during generation. This can cause issues on a publish with a large
// number of generations.
const pluginRenderTemplatesCache = new Map<string, ServerRenderTemplate>();

const importRenderTemplate = async (
  path: string
): Promise<ServerRenderTemplate> => {
  let module = pluginRenderTemplatesCache.get(path);
  if (!module) {
    module = (await import(path)) as ServerRenderTemplate;
    pluginRenderTemplatesCache.set(path, module);
  }
  return module;
};

// Represents a page produced by the generation procees.
export type GeneratedPage = {
  path: string;
  content?: string;
  redirects: (RedirectSource | string)[];
  authScope?: string;
};

/**
 * Takes in both a template module and its stream document, processes them, and writes them to disk.
 *
 * @param templateModuleInternal
 * @param templateProps
 * @param pluginRenderTemplates
 * @param manifest
 * @param projectStructure
 */
export const generateTemplateResponses = async (
  templateModuleInternal: TemplateModuleInternal<any, any>,
  templateProps: TemplateProps,
  pluginRenderTemplates: PluginRenderTemplates,
  manifest: Manifest,
  projectStructure: ProjectStructure
): Promise<GeneratedPage> => {
  if (templateModuleInternal.transformProps) {
    templateProps = await templateModuleInternal.transformProps(templateProps);
  }

  const path = templateModuleInternal.getPath(templateProps);
  validateGetPathValue(path, templateModuleInternal.templateName);

  const pathForRelativePrefixToRoot = templateProps.pathOverride ?? path;

  const templateRenderProps: TemplateRenderProps = {
    ...templateProps,
    path: path,
    relativePrefixToRoot: getRelativePrefixToRootFromPath(
      pathForRelativePrefixToRoot
    ),
  };

  const content = await renderHtml(
    templateModuleInternal,
    templateRenderProps,
    pluginRenderTemplates,
    manifest,
    projectStructure
  );

  return {
    content,
    path: path,
    redirects: templateModuleInternal.getRedirects?.(templateRenderProps) ?? [],
    authScope: templateModuleInternal.getAuthScope?.(templateProps) ?? "",
  };
};

/**
 * Checks the render and default export of a module and determines which to use to render html
 * content. The determination is made with the following rules:
 * 1. If module exports a default export and a render function, use the render function
 * 2. If a module exports a default export or a render function, use whatever is exported
 * 3. If a module doesn't export either, throw an error.
 */
const renderHtml = async (
  templateModuleInternal: TemplateModuleInternal<any, any>,
  props: TemplateRenderProps,
  pluginRenderTemplates: PluginRenderTemplates,
  manifest: Manifest,
  projectStructure: ProjectStructure
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

  return await reactWrapper(
    props,
    templateModuleInternal,
    templateModuleInternal.config.hydrate,
    pluginRenderTemplates,
    manifest,
    projectStructure
  );
};
