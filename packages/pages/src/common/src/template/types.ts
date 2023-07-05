import { HeadConfig } from "./head.js";

/**
 * The type to include in any template file. It defines the available functions and fields that are available
 * to the template.
 *
 * @public
 */
export interface TemplateModule<
  T extends TemplateProps,
  U extends TemplateRenderProps
> {
  /** The exported config function */
  config?: TemplateConfig;
  /** The optional exported transformProps function */
  transformProps?: TransformProps<T>;
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
export type GetRedirects<T extends TemplateProps> = (props: T) => string[];

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
export type Template<T extends TemplateRenderProps> = (props: T) => JSX.Element;

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
  /** The localization used by the filter */
  localization: {
    /** The entity profiles languages to apply to the stream */
    locales?: string[];
    /** Whether to include the primary profile language. Must be false when locales is defined. */
    primary: boolean;
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
  /** A map of feature name to the bundle path of the feature */
  bundlePaths: {
    [key: string]: string;
  };
  /** A map of render template to its bundle path */
  renderPaths: {
    [key: string]: string;
  };
  /** A map of project roots to their paths */
  projectFilepaths: {
    /** The folder path where all template files live */
    templatesRoot: string;
    /** The folder path where the compiled files live */
    distRoot: string;
    /** The folder path where the compiled server bundles live */
    serverBundleOutputRoot: string;
    /** The folder path where a subset of template files use for the build live */
    scopedTemplatesPath?: string;
  };
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
    /** A manifest of bundled files present during production mode */
    manifest?: Manifest;
  };
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
 * The type of the client/server render templates.
 */
export interface RenderTemplate {
  /** The render function required by the render templates */
  render(pageContext: PageContext<any>): Promise<string>;
}

/**
 * Context of a page, which defines the template itself and its props.
 */
export interface PageContext<T extends TemplateRenderProps<T>> {
  /** The props injected into the template */
  pageProps: T;
  /** The template to render */
  Page: Template<T>;
}
