import { TemplateConfigInternal } from "../template/internal/types.js";
import { RedirectConfigInternal } from "../redirect/internal/types.js";
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
  config: TemplateConfigInternal
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
  /** @deprecated field will be unsupported in the future */
  alternateLanguageFields?: string[];
  onUrlChange?: PluginFunctionSelector;
}

interface EntityPageSetConfig extends FeatureConfigBase {
  entityPageSet: {
    urlTemplate?: string;
    htmlTemplate?: string;
    linkedEntities?: { entityListField: string; templateField: string }[];
    pageUrlField?: string;
  };
}
interface StaticPageConfig extends FeatureConfigBase {
  staticPage: {
    urlTemplate?: string;
    htmlTemplate?: string;
    locales?: string[];
  };
}

interface PluginFunctionSelector {
  pluginName: string;
  functionName: string;
}

/**
 * A single feature representation for a {@link FeaturesConfig.features}.
 */
export type FeatureConfig = EntityPageSetConfig | StaticPageConfig;

/**
 * Converts a {@link TemplateConfigInternal} into a valid single {@link FeatureConfig}.
 */
export const convertTemplateConfigToFeatureConfig = (
  config: TemplateConfigInternal
): FeatureConfig => {
  const streamConfig = config.stream || null;

  const featureConfigBase: FeatureConfigBase = {
    name: config.name,
    streamId: streamConfig?.$id ?? config.streamId,
    templateType: "JS",
    alternateLanguageFields: config.alternateLanguageFields,
  };

  let featureConfig: FeatureConfig;
  // If the templateConfig does not reference a stream, assume it's a static feature.
  if (config.templateType === "static") {
    featureConfig = {
      ...featureConfigBase,
      staticPage: {
        locales: config.locales,
      },
    };
  } else {
    featureConfig = {
      ...featureConfigBase,
      entityPageSet: {
        pageUrlField: config.pageUrlField,
      },
    };
  }

  return featureConfig;
};

/**
 * Converts a {@link RedirectConfigInternal} into a valid single {@link FeatureConfig}.
 */
export const convertRedirectConfigToFeatureConfig = (
  config: RedirectConfigInternal
): FeatureConfig => {
  const streamConfig = config.stream || null;

  const featureConfigBase: FeatureConfigBase = {
    name: config.name,
    streamId: streamConfig?.$id ?? config.streamId,
    templateType: "JS",
  };

  return {
    ...featureConfigBase,
    entityPageSet: {},
  };
};
