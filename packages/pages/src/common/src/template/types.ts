import { ProjectStructureConfig } from "../project/structure.js";
import { HeadConfig } from "./head.js";
import React from "react";
import { RedirectSource } from "../redirect/types.js";

/**
 * The type to include in any template file. It defines the available functions and fields that are available
 * to the template.
 *
 * @public
 */
export interface TemplateModule<
  T extends TemplateProps,
  U extends TemplateRenderProps,
> {
  /** The exported config function */
  config?: TemplateConfig;
  /** The optional exported transformProps function */
  transformProps?: TransformProps<T>;
  /** The exported, optional getAuthScope function */
  getAuthScope?: GetAuthScope<T>;
  /** The exported getPath function */
  getPath: GetPath<T>;
  /** The exported, optional headFunction */
  getHeadConfig?: GetHeadConfig<U>;
  /** The exported, optional, function which returns a list of redirects */
  getRedirects?: GetRedirects<U>;
  /** The exported render function */
  render?: Render<U>;
  /**
   * The exported default template function. This is expected to be a React Component.
   * If undefined then {@link render} will be used to generate the HTML instead.
   */
  default?: Template<U>;
}

/**
 * The type definiton for the template's getRedirects function.
 *
 * @returns A list of redirect paths. All paths returned by this function will redirect to the path
 * defined by the template's getPath function.
 *
 * @public
 */
export type GetRedirects<T extends TemplateProps> = (
  props: T
) => (RedirectSource | string)[];

/**
 * The type definition for the template's transformProps function. Can be used
 * to alter and/or augement the props (which include the data document) passed
 * into the template at render time.
 * @public
 */
export type TransformProps<T extends TemplateProps> = (props: T) => Promise<T>;

/**
 * The type definition for the template's getPath function.
 *
 * @public
 */
export type GetPath<T extends TemplateProps> = (props: T) => string;

/**
 * The type definition for the template's GetAuthScope function.
 *
 * @public
 */
export type GetAuthScope<T extends TemplateProps> = (props: T) => string;

/**
 * The type definition for the template's getHeadConfig function. getHeadConfig
 * takes in the provided data and will output a HeadConfig object which will
 * be used to generate the tags inside the head tag of the generated HTML document.
 *
 * @public
 */
export type GetHeadConfig<T extends TemplateRenderProps> = (
  props: T
) => HeadConfig;

/**
 * The type definition for the template's render function.
 *
 * @public
 */
export type Render<T extends TemplateRenderProps<T>> = (props: T) => string;

/**
 * The type definition for the template's default function.
 *
 * @public
 */
export type Template<T extends TemplateRenderProps> = (
  props: T
) => React.JSX.Element;

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface TemplateConfig {
  /** The name of the template feature. If not defined uses the template filename (without extension) */
  name?: string;
  /** Determines if hydration is allowed or not for webpages */
  hydrate?: boolean;
  /** The stream that this template uses. If a stream is defined the streamId is not required. */
  streamId?: string;
  /** The stream configuration used by the template */
  stream?: Stream;
  /** The specific fields to add additional language options to based on the stream's localization */
  alternateLanguageFields?: string[];
  /** The name of the onUrlChange function to use. */
  onUrlChange?: string;
  /** The field to be used as the custom writeback URL for the template */
  pageUrlField?: string;
  /** The field to use as the slug for dynamic dev mode */
  slugField?: string;
  /** The field to pass additional metadata */
  additionalProperties?: string;
}

/**
 * Shape of TemplateConfig for Static Pages
 *
 * @public
 */
export interface StaticTemplateConfig {
  /** The name of the template feature. If not defined uses the template filename (without extension) */
  name?: string;
  /** Determines if hydration is allowed or not for webpages */
  hydrate?: boolean;
  /** The name of the onUrlChange function to use. */
  onUrlChange?: string;
  /** Locales for a static page */
  locales?: string[];
}

/**
 * The stream config defined in {@link TemplateConfig.stream}.
 *
 * @public
 */
export interface Stream {
  /** The identifier of the stream */
  $id: string;
  /** The fields to apply to the stream */
  fields: string[];
  /** The filter to apply to the stream */
  filter: {
    /** The entity IDs to apply to the stream */
    entityIds?: string[];
    /** The entity types to apply to the stream */
    entityTypes?: string[];
    /** The saved filters to apply to the stream */
    savedFilterIds?: string[];
  };
  /** The localization used by the filter. Either set primary: true or specify a locales array. */
  localization:
    | {
        /** The entity profiles languages to apply to the stream. */
        locales: string[];
        primary?: never;
      }
    | {
        /** Use the primary profile language. */
        primary: true;
        locales?: never;
      };
  /** The transformation to apply to the stream */
  transform?: {
    /** The option fields to be expanded to include the display fields, numeric values, and selected boolean */
    expandOptionFields?: string[];
    /** The option fields to be replaced with display names */
    replaceOptionValuesWithDisplayNames?: string[];
  };
}

/**
 * A manifest of bundled files present during a production build.
 *
 * @public
 */
export type Manifest = {
  /** A map of feature name to the server path of the feature */
  serverPaths: {
    [key: string]: string;
  };
  /** A map of feature name to the redirect path of the feature */
  redirectPaths: {
    [key: string]: string;
  };
  /** A map of feature name to the client path of the feature */
  clientPaths: {
    [key: string]: string;
  };
  /** A map of render template to its bundle path */
  renderPaths: {
    [key: string]: string;
  };
  /** The configuration structure of a project */
  projectStructure: ProjectStructureConfig;
  /** If the bundler used generates a manifest.json then this field will contain that json object */
  bundlerManifest?: any;
};

/**
 * The shape of the data passed directly to the different template functions with the
 * exception of the render function (getPath, getHeadConfig, etc).
 *
 * @public
 */
export interface TemplateProps<T = Record<string, any>> {
  /** The entire document returned after applying the stream to a single entity */
  document: T;
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
  /**
   * Set in the preview context of the generatepagecontent API endpoint. Since
   * the preview domain is different (occurs in the context of a serverless function)
   * the relativePrefixToRoot needs to be updated.
   */
  pathOverride?: string;
}

/**
 * The shape of the data passed directly to the template's render function.
 * Extends the {@link TemplateProps} interface and has the additions of a path
 * and a relativePrefixToRoot field.
 *
 * @public
 */
export interface TemplateRenderProps<T = any> extends TemplateProps<T> {
  /**
   * The path that the generated file will live at on the site, as defined
   * by the {@link GetPath} function.
   */
  path: string;
  /**
   * The relative path from the generated page to the root of the site.
   * i.e. The path example/path/foo would have the relativePrefixToRoot
   * of '../../'.
   */
  relativePrefixToRoot: string;
}

/**
 * Defines the paths of the _client and _server render templates. During execution
 * it will use the paths of the user's custom render templates if they exist,
 * otherwise it falls back to the ones built-in to PagesJS.
 *
 * @internal
 */
export interface ClientServerRenderTemplates {
  /** The path to _client.tsx */
  clientRenderTemplatePath: string;
  /** The path to _server.tsx */
  serverRenderTemplatePath: string;
  /** If the render templates are user-defined or built-in */
  isCustomRenderTemplate: boolean;
}

/**
 * The type of the server render template.
 *
 * @internal
 */
export interface ServerRenderTemplate {
  /** @deprecated The index.html entrypoint for your template */
  indexHtml: string;

  /** @deprecated The tag in indexHtml to replace with the contents of render */
  replacementTag: string;

  /** The render function required by the render templates */
  render(pageContext: PageContext<any>): Promise<string>;

  /** The index.html entrypoint for your template */
  getIndexHtml(pageContext: PageContext<any>): Promise<string>;

  /** The tag in indexHtml to replace with the contents of render */
  getReplacementTag(): Promise<string>;
}

/**
 * The type of the client render template.
 *
 * @internal
 */
export interface ClientRenderTemplate {
  /** The render function required by the render templates */
  render(pageContext: PageContext<any>): Promise<string>;
}

/**
 * Context of a page, which defines the template itself and its props.
 *
 * @internal
 */
export interface PageContext<T extends TemplateRenderProps<T>> {
  /** The props injected into the template */
  pageProps: T;
  /** The template to render */
  Page: Template<T>;
}
