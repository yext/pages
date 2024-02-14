import {
  Template,
  GetHeadConfig,
  GetPath,
  GetRedirects,
  TransformProps,
  Render,
  Stream,
  TemplateConfig,
  TemplateModule,
  TemplateProps,
  TemplateRenderProps,
} from "../types.js";
import path from "node:path";
import { validateTemplateModuleInternal } from "./validateTemplateModuleInternal.js";

/**
 * A domain representation of a template module. Contains all fields from an imported module as well
 * as metadata about the module used in downstream processing.
 */
export interface TemplateModuleInternal<
  T extends TemplateProps,
  U extends TemplateRenderProps,
> {
  /**
   * The filepath to the template file. This can be the raw TSX file when used during dev mode or
   * the path to the server bundle this module was imported from during prod build.
   */
  path: string;
  /** The name of the file (with extension) */
  filename: string;
  /** The name of the file (without extension) */
  templateName: string;
  /** The exported config function */
  config: TemplateConfigInternal;
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
  /** The exported default template function */
  default?: Template<U>;
}

/**
 * The exported `config` function's definition.
 */
export interface TemplateConfigInternal {
  /** The name of the template feature. If not defined uses the template filename (without extension) */
  name: string;
  /** Determines if hydration is allowed or not for webpages */
  hydrate: boolean;
  /** The stream that this template uses. If a stream is defined the streamId is not required. */
  streamId?: string;
  /** The stream configuration used by the template */
  stream?: StreamInternal;
  /**
   * The specific fields to add additional language options to based on the stream's localization.
   * @deprecated field will be unsupported in the future
   */
  alternateLanguageFields?: string[];
  /** The name of the onUrlChange function to use. */
  onUrlChange?: string;
  /** Locales for a Static Page */
  locales?: string[];
  /** The field to be used as the custom writeback URL for the template */
  pageUrlField?: string;
  /** The field to use as the slug for dynamic dev mode */
  slugField?: string;
  /** The type of template */
  templateType: "entity" | "static";
}

/**
 * The stream config defined in {@link TemplateConfigInternal.stream}.
 */
export interface StreamInternal {
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
  localization: {
    /** The entity profiles languages to apply to the stream */
    locales?: string[];
    /** Whether to include the primary profile language. */
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
 * Parses a filepath and returns the relevant parts, such as the base filename.
 */
export const parse = (
  filepath: string,
  adjustForFingerprintedAsset: boolean
) => {
  let base = filepath.split(path.sep)[filepath.split(path.sep).length - 1];
  const extension = base.slice(base.lastIndexOf("."));
  let name = base.slice(0, base.lastIndexOf("."));

  // Removes the fingerprint portion (for server bundles)
  if (adjustForFingerprintedAsset) {
    base =
      base
        .split(extension)[0]
        .slice(0, base.split(extension)[0].lastIndexOf(".")) + extension;
    name = name.slice(0, name.lastIndexOf("."));
  }

  return {
    base, // the root file with extension
    name, // the root file without extension
  };
};

export const isStaticTemplateConfig = (
  streamId: string | undefined,
  streamConfig: StreamInternal | undefined
): boolean => {
  return !streamId && (!streamConfig || !streamConfig.$id);
};

export const convertTemplateModuleToTemplateModuleInternal = (
  templateFilepath: string,
  templateModule: TemplateModule<any, any>,
  adjustForFingerprintedAsset: boolean
): TemplateModuleInternal<any, any> => {
  const templatePath = parse(templateFilepath, adjustForFingerprintedAsset);

  const templateModuleInternal = {
    ...templateModule,
    config: convertTemplateConfigToTemplateConfigInternal(
      templatePath.name,
      templateModule.config
    ),
    path: templateFilepath,
    filename: templatePath.base,
    templateName: templatePath.name,
  } as TemplateModuleInternal<any, any>;

  validateTemplateModuleInternal(templateModuleInternal);

  return templateModuleInternal;
};

export const convertTemplateConfigToTemplateConfigInternal = (
  templateName: string,
  templateConfig: TemplateConfig | undefined
): TemplateConfigInternal => {
  const stream = convertStreamToStreamInternal(templateConfig?.stream);

  return {
    name: templateConfig?.name ?? templateName,
    hydrate: templateConfig?.hydrate ?? true,
    ...templateConfig,
    stream: stream,
    templateType: isStaticTemplateConfig(templateConfig?.streamId, stream)
      ? "static"
      : "entity",
  };
};

/**
 * Converts a {@link Stream} into a valid {@link StreamInternal}
 * by setting stream.localization.primary: false if a locales array exists.
 */
const convertStreamToStreamInternal = (
  stream: Stream | undefined
): StreamInternal | undefined => {
  if (!stream) return;

  if (stream.localization.locales && stream.localization.locales.length > 0) {
    return {
      ...stream,
      localization: { locales: stream.localization.locales, primary: false },
    };
  }
  return { ...stream, localization: { primary: true } };
};
