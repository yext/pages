import React from "react";

/**
 * The type definition for the module's default function.
 *
 * @public
 */
export type Module = () => React.JSX.Element;

/**
 * The type to include in any module file.
 *
 * @public
 */
export interface ModuleDefinition {
  /** The exported config function */
  config: ModuleConfig;
  /** The default function that returns the JSX */
  default: Module;
}

/**
 * The configuration options for a Module.
 *
 * @public
 */
export interface ModuleConfig {
  /** Name of the module. If not defined uses the module filename (without extension) */
  name?: string;
}

/**
 * The shape of the data used in the Module.
 *
 * @public
 */
export interface ModuleProps<T = Record<string, any>> {
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
    universe: "development" | "qa" | "sandbox" | "production";
  };
  /** The document to use for AnalyticsProvider */
  document: T;
}

/**
 * Defines the paths of the _client and _server render templates modules for use in dev.
 * @internal
 */
export interface ModuleClientServerRenderTemplates {
  /** The path to _client.tsx */
  clientRenderModulePath: string;
  /** The path to _server.tsx */
  serverRenderModulePath: string;
}

/**
 * The type of the server render module.
 *
 * @internal
 */
export interface ServerModuleRenderTemplate {
  /** The render function required by the render templates */
  render(pageContext: ModuleContext): Promise<string>;

  /** The index.html entrypoint for your template */
  indexHtml: string;

  /** The tag in indexHtml to replace with the contents of render */
  replacementTag: string;
}

/**
 * The type of the client render module.
 *
 * @internal
 */
export interface ClientModuleRenderTemplate {
  /** The render function required by the render templates */
  render(pageContext: ModuleContext): Promise<string>;
}

/**
 * Context of a page, which defines the template itself and its props.
 *
 * @internal
 */
export interface ModuleContext {
  /** The template to render */
  Page: Module;
}
