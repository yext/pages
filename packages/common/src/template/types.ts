/**
 * A domain representation of a template module. Contains all fields from an imported module as well
 * as metadata about the module used in downstream processing.
 *
 * @public
 */
export interface TemplateModule<T> {
  /**
   * The filepath to the template file. This can be the raw TSX file when used during dev mode or
   * the path to the server bundle this module was imported from during prod build.
   */
  path: string;
  /** The name of the file */
  filename: string;
  /** The exported config function */
  config: TemplateConfig;
  /** The optional exported getStaticProps function */
  getStaticProps?: GetStaticProps<T>;
  /** The exported getPath function */
  getPath: GetPath<T>;
  /** The exported render function */
  render: Render<T>;
  /** The exported default function */
  default: Default<T>;
}

/**
 * The type definition for the template's getStaticProps function.
 *
 * @public
 */
export type GetStaticProps<T> = (data: Data) => Promise<T>;

/**
 * The type definition for the template's getPath function.
 *
 * @public
 */
export type GetPath<T> = (data: T) => string;

/**
 * The type definition for the template's render function.
 *
 * @public
 */
export type Render<T> = (data: T) => string;

/**
 * The type definition for the template's default function.
 *
 * @public
 */
export type Default<T> = (data: T) => JSX.Element;

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface TemplateConfig {
  /** The name of the template feature */
  name: string;
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
  /** If the bundler used generates a manifest.json then this field will contain that json object */
  bundlerManifest?: any;
};

/**
 * The shape of the data passed directly to the different template functions (render, getPath, etc).
 *
 * @public
 */
export interface Data {
  /** The entire document returned after applying the stream to a single entity */
  document: {
    /** The stream's entire output */
    streamOutput: Record<string, any>;
  };
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
  /** A manifest of bundled files present during production mode */
  manifest?: Manifest;
}
