import { TemplateConfigInternal } from "../template/internal/types.js";
import { convertTemplateConfigToStreamConfig, StreamConfig } from "./stream.js";

/**
 * The shape of data that represents a features.json file, used by Yext Pages.
 */
export interface FeaturesConfig {
  /** The feature configurations */
  features: FeatureConfig[];
  /** The stream configurations */
  streams?: StreamConfig[];
}

/**
 * Converts a {@link TemplateConfigInternal} into a valid {@link FeaturesConfig} (features and streams).
 */
export const convertTemplateConfigInternalToFeaturesConfig = (
  config: TemplateConfigInternal,
): FeaturesConfig => {
  const featureConfig = convertTemplateConfigToFeatureConfig(config);
  const streamConfig = convertTemplateConfigToStreamConfig(config);

  return {
    features: [featureConfig],
    ...(streamConfig ? { streams: [streamConfig] } : ""),
  };
};

interface FeatureConfigBase {
  name: string;
  streamId?: string;
  templateType: "JS";
  alternateLanguageFields?: string[];
}

interface EntityPageSetConfig extends FeatureConfigBase {
  entityPageSet: {
    plugin: Record<string, unknown>;
  };
}
interface StaticPageConfig extends FeatureConfigBase {
  staticPage: {
    plugin: Record<string, unknown>;
  };
}

/**
 * A single feature representation for a {@link FeaturesConfig.features}.
 */
export type FeatureConfig = EntityPageSetConfig | StaticPageConfig;

export const isStaticTemplateConfig = (
  config: TemplateConfigInternal,
): boolean => {
  const streamConfig = config.stream || null;
  return !config.streamId && (!streamConfig || !streamConfig.$id);
};

/**
 * Converts a {@link TemplateConfigInternal} into a valid single {@link FeatureConfig}.
 */
export const convertTemplateConfigToFeatureConfig = (
  config: TemplateConfigInternal,
): FeatureConfig => {
  const streamConfig = config.stream || null;

  const featureConfigBase: FeatureConfigBase = {
    name: config.name,
    streamId: streamConfig
      ? streamConfig.$id
      : config.streamId
      ? config.streamId
      : undefined,
    templateType: "JS",
    alternateLanguageFields: config.alternateLanguageFields,
  };

  let featureConfig: FeatureConfig;
  // If the templateConfig does not reference a stream, assume it's a static feature.
  if (isStaticTemplateConfig(config)) {
    featureConfig = {
      ...featureConfigBase,
      staticPage: {
        plugin: {},
      },
    };
  } else {
    featureConfig = {
      ...featureConfigBase,
      entityPageSet: {
        plugin: {},
      },
    };
  }

  return featureConfig;
};
