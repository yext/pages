import { TemplateProps, Stream } from "../template/types.js";

/**
 * The type of a RedirectSource. It defines the source and statusCode for a redirect.
 *
 * @public
 */
export interface RedirectSource {
  /** The source to redirect from */
  source: string;
  /** The status code of the redirect */
  statusCode: number;
}

/**
 * The type to include in any redirect file. It defines the available functions and fields that are available
 * to the redirect.
 *
 * @public
 */
export interface RedirectModule<T extends TemplateProps> {
  /** The exported config function */
  config?: RedirectConfig;
  /** The exported GetDestination function */
  getDestination: GetDestination<T>;
  /** The exported GetSources function */
  getSources: GetSources<T>;
}

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface RedirectConfig {
  /** The name of the redirect. If not defined uses the redirect filename (without extension) */
  name?: string;
  /** The stream that this redirect uses. If a stream is defined the streamId is not required. */
  streamId?: string;
  /** The stream configuration used by the redirect */
  stream?: Stream;
}

/**
 * The type definition for the redirect's getDestination function.
 *
 * @public
 */
export type GetDestination<T extends TemplateProps> = (props: T) => string;

/**
 * The type definiton for the redirect's getSources function.
 *
 * @returns A list of redirect sources. All paths returned by this function will redirect to the path
 * defined by the redirect's getDestination function.
 *
 * @public
 */
export type GetSources<T extends TemplateProps> = (
  props: T
) => RedirectSource[];
