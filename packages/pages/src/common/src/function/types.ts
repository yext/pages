import { GetPath } from "../template/types.js";
import { PluginEvent } from "../ci/ci.js";

/**
 * The type to include in any template file. It defines the available functions and fields that are available
 * to the template.
 *
 * @public
 */
export interface ServerlessFunctionModule<
  T extends ServerlessFunctionProps,
  U extends ServerlessFunctionRenderProps
> {
  /** The exported config function */
  config?: ServerlessFunctionConfig;
  /** The exported getPath function */
  getPath: GetPath<T>;
  /** The exported function */
  default?: Execute<U>;
}

/**
 * The type definition for the template's render function.
 *
 * @public
 */
export type Execute<T extends ServerlessFunctionRenderProps> = (
  props: T
) => HttpResponse;

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface ServerlessFunctionConfig {
  /** The name of the serverless function feature. */
  name?: string;
  /** The http event. */
  event?: PluginEvent;
  /** The function's name */
  functionName?: string;
}

/**
 * The shape of the data passed directly to the different template functions with the
 * exception of the render function (getPath, getHeadConfig, etc).
 *
 * @public
 */
export interface ServerlessFunctionProps {
  /** The entire document returned after applying the stream to a single entity */
  document: Record<string, any>;
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
}

/**
 * The shape of the data passed directly to the template's render function.
 * Extends the {@link ServerlessFunctionProps} interface and has the additions of a path
 * and a relativePrefixToRoot field.
 *
 * @public
 */
export interface ServerlessFunctionRenderProps extends ServerlessFunctionProps {
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

export type HttpResponse = {
  body?: string;
  statusCode: number;
  headers?: Headers;
};
