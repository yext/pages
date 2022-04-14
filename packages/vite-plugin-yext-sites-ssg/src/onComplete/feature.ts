import fs from "fs-extra";
import path from "path";
import { TemplateModuleCollection } from "./moduleLoader.js";

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
  for (const [featureName, mod] of templateModules.entries()) {
    const streamConfig = mod.config.stream || null;
    const streamId = mod.config.streamId;
    let featureConfig: FeatureConfig = {
      name: featureName,
      streamId: streamConfig ? streamConfig["$id"] : streamId ? streamId : "",
      templateType: "JS",
      entityPageSet: {
        plugin: {},
      },
    };
    if (!streamId && (!streamConfig || !streamConfig["$id"])) {
      featureConfig = {
        ...featureConfig,
        staticPage: {
          plugin: {},
        },
      };
      delete featureConfig["entityPageSet"];
    }
    features.push(featureConfig);
    featureNameToBundlePath.set(featureName, mod.serverPath);
    streamConfig && streams.push({ ...streamConfig });
  }

  const featureDir = path.dirname(featurePath);
  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir);
  }

  const featuresJson = mergeFeatureJson(featurePath, features, streams);
  fs.writeFileSync(
    featurePath,
    JSON.stringify(featuresJson, null, "  ")
  );
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
) => {
  let originalFeaturesJson = {} as any;
  if (fs.existsSync(featurePath)) {
    originalFeaturesJson = JSON.parse(fs.readFileSync(featurePath));
  }

  return {
    ...originalFeaturesJson,
    features,
    streams
  };
};

interface FeatureConfigBase {
  name: string;
  streamId: string;
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

type FeatureConfig = EntityPageSetConfig | StaticPageConfig;
