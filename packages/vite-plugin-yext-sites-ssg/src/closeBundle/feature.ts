import fs from "fs-extra";
import path from "path";
import { TemplateModuleCollection } from "./moduleLoader.js";
import { FeatureConfig, convertConfigToValidFeatureFormat } from "../../../common/feature/feature.js";
import { CogFeatureConfig } from "../../../common/feature/cogFeature";

/**
 * Run feature.json Generation. Returns a mapping of feature name to bundle path.
 */
export const createFeatureJson = async (
  templateModules: TemplateModuleCollection,
  featurePath: string
): Promise<Map<string, string>> => {
  const features: FeatureConfig[] = [];
  const streams = [];
  const featureNameToBundlePath = new Map();
  for (const [featureName, module] of templateModules.entries()) {
    const featureConfig = convertConfigToValidFeatureFormat(module.config);
    features.push(featureConfig);
    featureNameToBundlePath.set(featureName, module.path);
    module.config.stream && streams.push({ ...module.config.stream });
  }

  const featureDir = path.dirname(featurePath);
  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir);
  }

  const featuresJson = mergeFeatureJson(featurePath, features, streams);
  fs.writeFileSync(featurePath, JSON.stringify(featuresJson, null, "  "));
  return featureNameToBundlePath;
};

/**
 * Overwrites the "features" and "streams" fields in the feature.json while keeping other fields
 * if the feature.json already exists.
 */
const mergeFeatureJson = (
  featurePath: string,
  features: FeatureConfig[],
  streams: any
): CogFeatureConfig => {
  let originalFeaturesJson = {} as any;
  if (fs.existsSync(featurePath)) {
    originalFeaturesJson = JSON.parse(fs.readFileSync(featurePath));
  }

  return {
    ...originalFeaturesJson,
    features,
    streams,
  };
};
