import fs from "fs-extra";
import path from "path";
import {
  FeaturesConfig,
  FeatureConfig,
  convertTemplateConfigToFeatureConfig,
} from "../../common/src/feature/features.js";
import { TemplateModuleCollection } from "../../common/src/template/internal/loader.js";

export const getFeaturesConfig = async (
  templateModules: TemplateModuleCollection
): Promise<FeaturesConfig> => {
  const features: FeatureConfig[] = [];
  const streams: any[] = [];
  for (const module of templateModules.values()) {
    const featureConfig = convertTemplateConfigToFeatureConfig(module.config);
    features.push(featureConfig);
    module.config.stream && streams.push({ ...module.config.stream });
  }

  return { features, streams };
};

/**
 * Generates a features.json from the templates.
 */
export const createFeaturesJson = async (
  templateModules: TemplateModuleCollection,
  featurePath: string
): Promise<void> => {
  const { features, streams } = await getFeaturesConfig(templateModules);
  const featureDir = path.dirname(featurePath);
  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir);
  }
  const featuresJson = mergeFeatureJson(featurePath, features, streams);
  fs.writeFileSync(featurePath, JSON.stringify(featuresJson, null, "  "));
};

/**
 * Overwrites the "features" and "streams" fields in the feature.json while keeping other fields
 * if the feature.json already exists.
 */
const mergeFeatureJson = (
  featurePath: string,
  features: FeatureConfig[],
  streams: any
): FeaturesConfig => {
  let originalFeaturesJson = {} as any;
  if (fs.existsSync(featurePath)) {
    originalFeaturesJson = JSON.parse(fs.readFileSync(featurePath).toString());
  }

  return {
    ...originalFeaturesJson,
    features,
    streams,
  };
};
