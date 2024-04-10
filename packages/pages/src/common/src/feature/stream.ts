import { TemplateConfigInternal } from "../template/internal/types.js";
import { RedirectConfigInternal } from "../redirect/internal/types.js";

/**
 * The shape of data that represents a stream configuration.
 */
export interface StreamConfig {
  /** The identifier of the stream */
  $id: string;
  /** The source of the stream */
  source: string;
  /** The destination of the stream */
  destination: string;
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
 * Converts a {@link TemplateConfig.config.stream} into a valid {@link StreamConfig}.
 */
export const convertTemplateConfigToStreamConfig = (
  // config is optional for a user to set
  config: TemplateConfigInternal | undefined
): StreamConfig | void => {
  if (!config) {
    return;
  }
  if (config.stream) {
    return {
      ...config.stream,
      source: "knowledgeGraph",
      destination: "pages",
    };
  }
};

/**
 * Converts a {@link RedirectConfig.config.stream} into a valid {@link StreamConfig}.
 */
export const convertRedirectConfigToStreamConfig = (
  // config is optional for a user to set
  config: RedirectConfigInternal | undefined
): StreamConfig | void => {
  if (!config) {
    return;
  }
  if (config.stream) {
    return {
      ...config.stream,
      source: "knowledgeGraph",
      destination: "pages",
    };
  }
};
