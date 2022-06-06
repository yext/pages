import { TemplateConfig } from "../template/types";
import { convertTemplateConfigToStreamConfig, StreamConfig } from "./stream";

/**
 * The shape of data that represents a features.json file, used by Yext Sites.
 */
export interface FeaturesConfig {
  /** The feature configurations */
  features: FeatureConfig[];
  /** The stream configurations */
  streams?: StreamConfig[];
}

/**
 * Converts a {@link TemplateConfig.config} into a valid {@link FeaturesConfig} (features and streams).
 */
export const convertTemplateConfigToFeaturesConfig = (
  config: TemplateConfig
): FeaturesConfig => {
  const featureConfig = convertTemplateConfigFeatureConfig(config);
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
}

interface EntityPageSetConfig extends FeatureConfigBase {
  entityPageSet: {
    plugin: {};
  };
}
interface StaticPageConfig extends FeatureConfigBase {
  staticPage: {
    plugin: {};
  };
}

/**
 * A single feature representation for a {@link FeaturesConfig.features}.
 */
export type FeatureConfig = EntityPageSetConfig | StaticPageConfig;

/**
 * Converts a {@link TemplateConfig.config} into a valid single {@link FeatureConfig}.
 */
export const convertTemplateConfigFeatureConfig = (
  config: TemplateConfig
): FeatureConfig => {
  validate(config);

  const streamConfig = config.stream || null;

  let featureConfigBase: FeatureConfigBase = {
    name: config.name,
    streamId: streamConfig
      ? streamConfig.$id
      : config.streamId
      ? config.streamId
      : undefined,
    templateType: "JS",
  };

  let featureConfig: FeatureConfig;
  // If the templateConfig does not reference a stream, assume it's a static feature.
  if (!config.streamId && (!streamConfig || !streamConfig.$id)) {
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

const validate = (config: TemplateConfig) => {
  if (config.streamId && config.stream) {
    throw new Error(
      `TemplateConfig must not define both a "streamId" and a "stream".`
    );
  }
};
