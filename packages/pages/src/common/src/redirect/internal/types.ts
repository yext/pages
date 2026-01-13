import { TemplateProps } from "../../template/types.js";
import {
  convertStreamToStreamInternal,
  parse,
  StreamInternal,
} from "../../template/internal/types.js";
import { GetDestination, GetSources, RedirectConfig, RedirectModule } from "../types.js";
import { validateRedirectModuleInternal } from "./validateRedirectModuleInternal.js";

/**
 * A domain representation of a redirect module. Contains all fields from an imported module as well
 * as metadata about the module used in downstream processing.
 */
export interface RedirectModuleInternal<T extends TemplateProps> {
  /**
   * The filepath to the redirect file. This can be the raw TSX file when used during dev mode or
   * the path to the server bundle this module was imported from during prod build.
   */
  path: string;
  /** The name of the file (with extension) */
  filename: string;
  /** The name of the file (without extension) */
  redirectName: string;
  /** The exported config function */
  config: RedirectConfigInternal;
  /** The exported getDestination function **/
  getDestination: GetDestination<T>;
  /** The exported getSources function **/
  getSources: GetSources<T>;
}

/**
 * The exported `config` function's definition.
 */
export interface RedirectConfigInternal {
  /** The name of the redirect. If not defined uses the redirect filename (without extension) */
  name: string;
  /** The stream that this redirect uses. If a stream is defined the streamId is not required. */
  streamId?: string;
  /** The stream configuration used by the redirect */
  stream?: StreamInternal;
}

export const convertRedirectModuleToRedirectModuleInternal = (
  redirectFilepath: string,
  redirectModule: RedirectModule<any>,
  adjustForFingerprintedAsset: boolean
): RedirectModuleInternal<any> => {
  const redirectPath = parse(redirectFilepath, adjustForFingerprintedAsset);

  const redirectModuleInternal = {
    ...redirectModule,
    config: convertRedirectConfigToRedirectConfigInternal(redirectPath.name, redirectModule.config),
    path: redirectFilepath,
    filename: redirectPath.base,
    redirectName: redirectPath.name,
  } as RedirectModuleInternal<any>;

  validateRedirectModuleInternal(redirectModuleInternal);

  return redirectModuleInternal;
};

export const convertRedirectConfigToRedirectConfigInternal = (
  redirectName: string,
  redirectConfig: RedirectConfig | undefined
): RedirectConfigInternal => {
  const stream = convertStreamToStreamInternal(redirectConfig?.stream);

  return {
    name: redirectConfig?.name ?? redirectName,
    ...redirectConfig,
    stream: stream,
  };
};
