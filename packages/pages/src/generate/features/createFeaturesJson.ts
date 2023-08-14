import fs from "fs-extra";
import path from "path";
import {
  FeaturesConfig,
  FeatureConfig,
  convertTemplateConfigToFeatureConfig,
} from "../../common/src/feature/features.js";
import { TemplateModuleCollection } from "../../common/src/template/internal/loader.js";
import { ProjectStructure } from "../../common/src/project/structure.js";

export const getFeaturesConfig = async (
  templateModules: TemplateModuleCollection,
  projectStructure: ProjectStructure
): Promise<FeaturesConfig> => {
  const features: FeatureConfig[] = [];
  const streams: any[] = [];
  for (const module of templateModules.values()) {
    const featureConfig = convertTemplateConfigToFeatureConfig(
      module.config,
      projectStructure
    );
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
  projectStructure: ProjectStructure
): Promise<void> => {
  const { features, streams } = await getFeaturesConfig(
    templateModules,
    projectStructure
  );
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
