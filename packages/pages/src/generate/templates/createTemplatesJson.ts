import fs from "fs-extra";
import isEqual from "lodash/isEqual.js";
import path from "path";
import {
  FeaturesConfig,
  FeatureConfig,
  convertTemplateConfigToFeatureConfig,
  convertRedirectConfigToFeatureConfig,
} from "../../common/src/feature/features.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import {
  StreamConfig,
  convertTemplateConfigToStreamConfig,
  convertRedirectConfigToStreamConfig,
} from "../../common/src/feature/stream.js";
import {
  TemplateModuleCollection,
  loadTemplateModules,
} from "../../common/src/template/loader/loader.js";
import {
  loadRedirectModules,
  RedirectModuleCollection,
} from "../../common/src/redirect/loader/loader.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { getRedirectFilePaths } from "../../common/src/redirect/internal/getRedirectFilepaths.js";
import { TemplateManifest } from "../../common/src/template/types.js";

/**
 * Loads the templates as modules and generates a templates.json or
 * features.json from the templates.
 */
export const createTemplatesJson = async (
  projectStructure: ProjectStructure,
  type: "FEATURES" | "TEMPLATES"
): Promise<void> => {
  const { templateModules, redirectModules } =
    await getTemplateModules(projectStructure);

  return createTemplatesJsonFromModule(
    templateModules,
    redirectModules,
    projectStructure,
    type
  );
};

/**
 * Generates a templates.json or features.json from the templates.
 */
export const createTemplatesJsonFromModule = async (
  templateModules: TemplateModuleCollection,
  redirectModules: RedirectModuleCollection,
  projectStructure: ProjectStructure,
  type: "FEATURES" | "TEMPLATES"
): Promise<void> => {
  // Note: the object used to be known as "features" but it's been changed to "templates".
  // We're allowing the generation of a features.json file still for backwards compatibility,
  // which is why all of the types have not yet been renamed.
  const { features, streams } = getTemplatesConfig(
    templateModules,
    projectStructure,
    redirectModules
  );
  let templatesAbsolutePath;

  switch (type) {
    case "FEATURES":
      templatesAbsolutePath = path.resolve(
        projectStructure.getSitesConfigPath().path,
        projectStructure.config.sitesConfigFiles.features
      );
      break;
    case "TEMPLATES":
      templatesAbsolutePath = path.resolve(
        projectStructure.getScopedDistPath().path,
        projectStructure.config.distConfigFiles.templates
      );
      break;
  }

  const templatesDir = path.dirname(templatesAbsolutePath);
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // features.json is merged with the existing data a user can set. For templates.json the extra
  // data is defined in config.yaml, so the merging is unncessary there.
  let templatesJson;
  switch (type) {
    case "FEATURES":
      templatesJson = mergeFeatureJson(
        templatesAbsolutePath,
        features,
        streams
      );
      break;
    case "TEMPLATES":
      templatesJson = { features, streams };
      break;
  }

  fs.writeFileSync(
    templatesAbsolutePath,
    JSON.stringify(templatesJson, null, "  ")
  );
};

/**
 * Helper to get the template modules from the project structure
 * @param projectStructure
 */
export const getTemplateModules = async (
  projectStructure: ProjectStructure
) => {
  const templateFilepaths = getTemplateFilepaths(
    projectStructure.getTemplatePaths()
  );
  const redirectFilepaths = getRedirectFilePaths(
    projectStructure.getRedirectPaths()
  );
  const templateModules = await loadTemplateModules(
    templateFilepaths,
    true,
    false,
    projectStructure
  );

  const redirectModules = await loadRedirectModules(
    redirectFilepaths,
    true,
    false,
    projectStructure
  );
  return { templateModules, redirectModules };
};

export const getTemplatesConfig = (
  templateModules: TemplateModuleCollection,
  projectStructure: ProjectStructure,
  redirectModules?: RedirectModuleCollection
): FeaturesConfig => {
  const features: FeatureConfig[] = [];
  const streams: StreamConfig[] = [];
  for (const module of templateModules.values()) {
    let inPlatformTemplateNames: string[] = [];

    const templateManifestPath = projectStructure
      .getTemplateManifestPath()
      .getAbsolutePath();

    if (fs.existsSync(templateManifestPath)) {
      const templateManifest = JSON.parse(
        fs.readFileSync(templateManifestPath, "utf-8")
      ) as TemplateManifest;

      inPlatformTemplateNames = templateManifest.templates.map(
        (templateInfo) => templateInfo.name
      );
    }

    if (inPlatformTemplateNames.includes(module.config.name)) {
      // skip in-platform page sets
      continue;
    }

    const featureConfig = convertTemplateConfigToFeatureConfig(module.config);
    features.push(featureConfig);
    const streamConfig = convertTemplateConfigToStreamConfig(module.config);
    if (streamConfig) {
      pushStreamConfigIfValid(streams, streamConfig);
    }
  }
  if (redirectModules) {
    for (const module of redirectModules.values()) {
      const featureConfig = convertRedirectConfigToFeatureConfig(module.config);
      features.push(featureConfig);
      const streamConfig = convertRedirectConfigToStreamConfig(module.config);
      if (streamConfig) {
        pushStreamConfigIfValid(streams, streamConfig);
      }
    }
  }

  return { features, streams };
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

export const pushStreamConfigIfValid = (
  streams: StreamConfig[],
  streamConfig: StreamConfig
): void => {
  const matchingStreamConfig = streams.find(
    (stream) => stream.$id === streamConfig.$id
  );
  if (!matchingStreamConfig) {
    streams.push(streamConfig);
    return;
  }
  if (isEqual(matchingStreamConfig, streamConfig)) {
    return;
  }
  throw `Conflicting configurations found for stream ID: ${streamConfig.$id}`;
};
