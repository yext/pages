import fs from "fs-extra";
import glob from "glob";
import path from "path";
import {
  FeaturesConfig,
  FeatureConfig,
  convertTemplateConfigToFeatureConfig,
} from "../common/src/feature/features.js";
import {
  loadTemplateModules,
  TemplateModuleCollection,
} from "../common/src/template/internal/loader.js";

const TEMPLATES_ROOT = "/src/templates";

export const features = async (): Promise<void> => {
  const templateModules = await loadTemplateModules(
    glob.sync(path.join(process.cwd(), TEMPLATES_ROOT, "/**/*.{tsx,jsx}")),
    true,
    false
  );
  await createFeaturesJson(templateModules, "./sites-config/features.json");
};

/**
 * Generates a features.json from the templates.
 */
export const createFeaturesJson = async (
  templateModules: TemplateModuleCollection,
  featurePath: string
): Promise<void> => {
  const features: FeatureConfig[] = [];
  const streams = [];
  for (const [_, module] of templateModules.entries()) {
    const featureConfig = convertTemplateConfigToFeatureConfig(module.config);
    features.push(featureConfig);
    module.config.stream && streams.push({ ...module.config.stream });
  }

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