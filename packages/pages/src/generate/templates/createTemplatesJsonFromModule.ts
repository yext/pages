import fs from "fs-extra";
import path from "path";
import {
  FeaturesConfig,
  FeatureConfig,
  convertTemplateConfigToFeatureConfig,
} from "../../common/src/feature/features.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { StreamConfig } from "../../common/src/feature/stream.js";
import { TemplateModuleCollection } from "../../common/src/template/loader/loader.js";

// TODO: rename functions in this file once there is a migration flow and checks for it
// TODO: mergeFeatureJson will no longer be necessary
// TODO: write to dist/templates.json

export const getFeaturesConfig = (
  templateModules: TemplateModuleCollection
): FeaturesConfig => {
  const features: FeatureConfig[] = [];
  const streams: StreamConfig[] = [];
  for (const module of templateModules.values()) {
    const featureConfig = convertTemplateConfigToFeatureConfig(module.config);
    features.push(featureConfig);
    module.config.stream &&
      streams.push({
        ...module.config.stream,
        source: "knowledgeGraph",
        destination: "pages",
      });
  }

  return { features, streams };
};

/**
 * Generates a features.json from the templates.
 */
export const createFeaturesJson = (
  templateModules: TemplateModuleCollection,
  projectStructure: ProjectStructure
): void => {
  const { features, streams } = getFeaturesConfig(templateModules);
  const featuresAbsolutePath = path.resolve(
    projectStructure.getSitesConfigPath().path,
    projectStructure.config.sitesConfigFiles.features
  );

  const featureDir = path.dirname(featuresAbsolutePath);
  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir);
  }
  const featuresJson = mergeFeatureJson(
    featuresAbsolutePath,
    features,
    streams
  );
  fs.writeFileSync(
    featuresAbsolutePath,
    JSON.stringify(featuresJson, null, "  ")
  );
};

/**
 * Overwrites the "features" and "streams" fields in the feature.json while keeping other fields
 * if the feature.json already exists.
 */
export const mergeFeatureJson = (
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
