/**
 * A domain representation of a template module. Contains all fields from an imported module as well
 * as metadata about the module used in downstream processing.
 * 
 * @public
 */
export interface TemplateModule<TData> {
  // The filepath to the template file. This can be the raw TSX file when used during dev mode or
  // the path to the server bundle this module was imported from during prod build.
  path: string;
  filename: string;
  config: Config;
  getStaticProps?: (data: Data) => Promise<TData>;
  getPath: (data: TData) => string;
  render: (data: TData) => string;
  default: (data: TData) => JSX.Element;
}

/**
 * The exported `config` function's definition.
 * 
 * @public
 */
export interface Config {
  name: string;
  streamId?: string;
  stream?: Stream;
};

/**
 * The stream portion of the exported `config` function's definition.
 * 
 * @public
 */
export interface Stream {
  $id: string;
  fields: string[];
  filter: {
    entityTypes?: string[];
    savedFilterIds?: string[];
  };
  localization: {
    locales: string[];
    primary: boolean;
  };
};

/**
 * The shape of the data that Sites Cog generates.
 * 
 * @public
 */
export interface Data {
  document: { streamOutput: any };
  __meta: {
    mode: "development" | "production";
  };
};
