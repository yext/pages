/**
 * The type definition for the module's default function.
 *
 * @public
 */
export type Module = () => React.JSX.Element;

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
 * The shape of the data passed directly to the module's default export.
 *
 * @public
 */
export interface ModuleProps {
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
}