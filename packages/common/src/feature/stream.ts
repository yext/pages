import { TemplateConfig } from "../template/types";

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
 * Converts a {@link TemplateConfig.config.stream} into a valid {@link StreamConfig}.
 */
export const convertTemplateConfigToStreamConfig = (
  config: TemplateConfig
): StreamConfig | void => {
  if (config.stream) {
    return {
      ...config.stream,
      source: "knowledgeGraph",
      destination: "pages",
    };
  }
};
