import { Config } from "../templateModule/types";
import { convertConfigToValidFeatureFormat, FeatureConfig } from "./feature";
import { convertConfigToValidStreamFormat, StreamConfig } from "./stream";

/**
 * Represents the feature configuration required by SitesCog - a features.json file.
 */
export interface CogFeatureConfig {
  locales?: string[];
  features: FeatureConfig[];
  streams?: StreamConfig[];
}

export const convertConfigToValidCogFormat = (
  config: Config
): CogFeatureConfig => {
  const featureConfig = convertConfigToValidFeatureFormat(config);
  const streamConfig = convertConfigToValidStreamFormat(config);

  return {
    features: [featureConfig],
    ...(streamConfig ? { streams: [streamConfig] } : ""),
  };
};
