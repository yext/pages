import { TemplateConfig, TemplateProps } from "../template/types.js";

export interface RedirectSource {
  source: string;
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
  config?: TemplateConfig;
  getDestination: GetDestination<T>;
  getSources: GetSources<T>;
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
