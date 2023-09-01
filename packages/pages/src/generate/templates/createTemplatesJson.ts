import fs from "fs-extra";
import path from "path";
import {
  FeaturesConfig,
  FeatureConfig,
  convertTemplateConfigToFeatureConfig,
} from "../../common/src/feature/features.js";
import { TemplateModuleCollection } from "../../common/src/template/internal/loader.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import {
  StreamConfig,
  convertTemplateConfigToStreamConfig,
} from "../../common/src/feature/stream.js";

export const getTemplatesConfig = (
  templateModules: TemplateModuleCollection
): FeaturesConfig => {
  const features: FeatureConfig[] = [];
  const streams: StreamConfig[] = [];
  for (const module of templateModules.values()) {
    const featureConfig = convertTemplateConfigToFeatureConfig(module.config);
    features.push(featureConfig);
    const streamConfig = convertTemplateConfigToStreamConfig(module.config);
    if (streamConfig) {
      streams.push(streamConfig);
    }
  }

  return { features, streams };
};

/**
 * Generates a templates.json from the templates.
 */
export const createTemplatesJson = (
  templateModules: TemplateModuleCollection,
  projectStructure: ProjectStructure
): void => {
  // Note: the object used to be known as "features" but it's been changed to "templates".
  // We're allowing the generation of a features.json file still for backwards compatibility,
  // which is why all of the types have not yet been renamed.
  const { features, streams } = getTemplatesConfig(templateModules);
  const templatesAbsolutePath = path.resolve(
    projectStructure.config.rootFolders.dist,
    projectStructure.config.distConfigFiles.templates
  );

  const templatesDir = path.dirname(templatesAbsolutePath);
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir);
  }

  fs.writeFileSync(
    templatesAbsolutePath,
    JSON.stringify({ features, streams }, null, "  ")
  );
};
