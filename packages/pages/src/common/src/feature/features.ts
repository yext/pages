import fs from "fs";
import { TemplateConfigInternal } from "../template/internal/types.js";
import { convertTemplateConfigToStreamConfig, StreamConfig } from "./stream.js";
import { unsecureHashPluginName } from "../function/internal/types.js";
import { defaultProjectStructureConfig } from "../project/structure.js";

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
  alternateLanguageFields?: string[];
  onUrlChange?: PluginFunctionSelector;
}

interface EntityPageSetConfig extends FeatureConfigBase {
  entityPageSet: {
    urlTemplate?: string;
    htmlTemplate?: string;
    linkedEntities?: { entityListField: string; templateField: string }[];
  };
}
interface StaticPageConfig extends FeatureConfigBase {
  staticPage: {
    urlTemplate?: string;
    htmlTemplate?: string;
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

export const isStaticTemplateConfig = (
  config: TemplateConfigInternal
): boolean => {
  const streamConfig = config.stream || null;
  return !config.streamId && (!streamConfig || !streamConfig.$id);
};

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

  // If an onUrlChange function name is specified in the feature config, look up that plugin and
  // calculate its hashed name for use in features.json
  if (config.onUrlChange) {
    try {
      // Have to look up the filename from the functions directory because we do not know file extension
      const onUrlChangeFilenames = fs.readdirSync(
        defaultProjectStructureConfig.filepathsConfig.functionsRoot +
          "/onUrlChange"
      );
      const filename = onUrlChangeFilenames.find((name) =>
        name.includes(config.onUrlChange ?? "")
      );
      if (filename) {
        featureConfigBase.onUrlChange = {
          pluginName:
            config.onUrlChange +
            "-" +
            unsecureHashPluginName("onUrlChange/" + filename),
          functionName: "default",
        };
      } else {
        console.warn("Could not find file onUrlChange/" + config.onUrlChange);
      }
    } catch (e) {
      console.warn(
        `Error resolving onUrlChange plugin name ${config.onUrlChange}:\n${e}`
      );
    }
  }

  let featureConfig: FeatureConfig;
  // If the templateConfig does not reference a stream, assume it's a static feature.
  if (isStaticTemplateConfig(config)) {
    featureConfig = {
      ...featureConfigBase,
      staticPage: {},
    };
  } else {
    featureConfig = {
      ...featureConfigBase,
      entityPageSet: {},
    };
  }

  return featureConfig;
};
