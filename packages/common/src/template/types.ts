import { HeadConfig } from "./head.js";

/**
 * The type to include in any template file. It defines the available functions and fields that are available
 * to the template.
 *
 * @public
 */
export interface TemplateModule<T extends TemplateProps> {
  /** The exported config function */
  config?: TemplateConfig;
  /** The optional exported getStaticProps function */
  getStaticProps?: GetStaticProps<T>;
  /** The exported getPath function */
  getPath: GetPath<T>;
  /** The exported, optional headFunction */
  getHeadConfig?: GetHeadConfig<T>;
  /** The exported render function */
  render?: Render<T>;
  /** The exported default function */
  default: Default<T>;
}

/**
 * The type definition for the template's getStaticProps function.
 *
 * @public
 */
export type GetStaticProps<T extends TemplateProps> = (props: T) => Promise<T>;

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
export type GetHeadConfig<T extends TemplateProps> = (props: T) => HeadConfig;

/**
 * The type definition for the template's render function.
 *
 * @public
 */
export type Render<T extends TemplateProps> = (props: T) => string;

/**
 * The type definition for the template's default function.
 *
 * @public
 */
export type Default<T extends TemplateProps> = (props: T) => JSX.Element;

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface TemplateConfig {
  /** The name of the template feature. If not defined uses the template filename (without extension) */
  name?: string;
  /** The stream that this template uses. If a stream is defined the streamId is not required. */
  streamId?: string;
  /** The stream configuration used by the template */
  stream?: Stream;
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
  /** A map of project roots to their paths */
  projectFilepaths: {
    /** The folder path where the template files live */
    templatesRoot: string;
    /** The folder path where the compiled files live */
    distRoot: string;
    /** The folder path where the compiled hydration bundles live */
    hydrationBundleOutputRoot: string;
    /** The folder path where the compiled server bundles live */
    serverBundleOutputRoot: string;
  };
  /** If the bundler used generates a manifest.json then this field will contain that json object */
  bundlerManifest?: any;
};

/**
 * The shape of the data passed directly to the different template functions (render, getPath, etc).
 *
 * @public
 */
export interface TemplateProps {
  /** The entire document returned after applying the stream to a single entity */
  document: {
    /** The name of the feature */
    feature: string;
    /** The stream's entire output */
    streamOutput: Record<string, any>;
  };
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
    /** A manifest of bundled files present during production mode */
    manifest?: Manifest;
  };
}
