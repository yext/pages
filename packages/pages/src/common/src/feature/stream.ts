import fs from "fs";
import path from "path";
import YAML from "yaml";

import { readJsonSync } from "../../../upgrade/migrateConfig.js";
import { TemplateConfigInternal } from "../template/internal/types.js";
import { RedirectConfigInternal } from "../redirect/internal/types.js";
import { ProjectStructure } from "../project/structure.js";
import { logErrorAndExit } from "../../../util/logError.js";
import { Stream } from "../template/types.js";
import { processEnvVariables } from "../../../util/processEnvVariables.js";

/**
 * The shape of data that represents a stream configuration.
 */
export interface StreamConfig {
  /** The identifier of the stream */
  $id: string;
  /** The source of the stream */
  source: string;
  /** The destination of the stream */
  destination: string;
  /** The fields to apply to the stream */
  fields: string[];
  /** The filter to apply to the stream */
  filter?: {
    /** The entity IDs to apply to the stream */
    entityIds?: string[];
    /** The entity types to apply to the stream */
    entityTypes?: string[];
    /** The saved filters to apply to the stream */
    savedFilterIds?: string[];
  };
  /** The localization used by the filter */
  localization: {
    /** The entity profiles languages to apply to the stream */
    locales?: string[];
    /** Whether to include the primary profile language. */
    primary: boolean;
  };
  /** The transformation to apply to the stream */
  transform?: {
    /** The option fields to be expanded to include the display fields, numeric values, and selected boolean */
    expandOptionFields?: string[];
    /** The option fields to be replaced with display names */
    replaceOptionValuesWithDisplayNames?: string[];
  };
  /** The option to include certified facts in the stream. */
  includeCertifiedFacts?: boolean;
}

/**
 * The shape of data that represents a site stream.
 * Similar to {@link StreamConfig} but there can only be one entityId.
 */
export interface SiteStream {
  /** Identifies the stream */
  id: string;
  /** The entity id of the site stream */
  entityId: string;
  /** The fields to apply to the stream */
  fields: string[];
  /** The localization used by the filter. Either set primary: true or specify a locales array. */
  localization:
    | {
        /** The entity profiles languages to apply to the stream. */
        locales: string[];
        primary?: never;
      }
    | {
        /** Use the primary profile language. */
        primary: true;
        locales?: never;
      };
  /** The transformation to apply to the stream */
  transform?: {
    /** The option fields to be expanded to include the display fields, numeric values, and selected boolean */
    expandOptionFields?: string[];
    /** The option fields to be replaced with display names */
    replaceOptionValuesWithDisplayNames?: string[];
  };
}

/**
 * Converts a {@link TemplateConfig.config.stream} into a valid {@link StreamConfig}.
 */
export const convertTemplateConfigToStreamConfig = (
  // config is optional for a user to set
  config: TemplateConfigInternal | undefined
): StreamConfig | void => {
  if (!config) {
    return;
  }

  if (config.stream && !config.stream.filter && !config.additionalProperties?.isVETemplate) {
    logErrorAndExit("Filter is required in StreamConfig for templates.");
  }

  if (config.stream) {
    return {
      ...config.stream,
      source: "knowledgeGraph",
      destination: "pages",
    };
  }
};

/**
 * Converts a {@link RedirectConfig.config.stream} into a valid {@link StreamConfig}.
 */
export const convertRedirectConfigToStreamConfig = (
  // config is optional for a user to set
  config: RedirectConfigInternal | undefined
): StreamConfig | void => {
  if (!config) {
    return;
  }
  if (config.stream) {
    return {
      ...config.stream,
      source: "knowledgeGraph",
      destination: "pages",
    };
  }
};

/**
 * Recursively traverses a configuration object and substitutes
 * string values that match keys in the envVars map. Returns a
 * new object with substituted values.
 */
const substituteEnvVars = <T>(configData: T, envVars: Record<string, string>): T => {
  if (typeof configData === "string") {
    const envValue = envVars[configData];
    if (envValue !== undefined) {
      try {
        return JSON.parse(envValue);
      } catch {
        return envValue as T;
      }
    }
    return configData;
  }

  if (Array.isArray(configData)) {
    return configData.map((item) => substituteEnvVars(item, envVars)) as T;
  }

  if (configData && typeof configData === "object") {
    const newConfig: { [key: string]: any } = {};
    for (const key in configData) {
      if (Object.prototype.hasOwnProperty.call(configData, key)) {
        const value = (configData as any)[key];
        newConfig[key] = substituteEnvVars(value, envVars);
      }
    }
    return newConfig as T;
  }

  return configData;
};

/**
 * Loads the site stream specified in config.yaml or site-stream.json into a {@link SiteStream}.
 */
export const readSiteStream = (projectStructure: ProjectStructure): SiteStream | undefined => {
  // read site stream from deprecated sites-config directory if it exists
  const siteStreamJsonPath = path.resolve(
    projectStructure.getSitesConfigPath().path,
    projectStructure.config.sitesConfigFiles.siteStream
  );
  if (fs.existsSync(siteStreamJsonPath)) {
    const sitesJson = readJsonSync(siteStreamJsonPath);
    return formatSiteStream(sitesJson, siteStreamJsonPath);
  }

  // read site stream from config.yaml
  const configYamlPath = projectStructure.getConfigYamlPath().getAbsolutePath();
  if (fs.existsSync(configYamlPath)) {
    let yamlDoc = YAML.parse(fs.readFileSync(configYamlPath, "utf-8"));
    const envVars = processEnvVariables(projectStructure.config.envVarConfig.envVarPrefix);
    yamlDoc = substituteEnvVars(yamlDoc, envVars);

    if (yamlDoc.siteStream) {
      yamlDoc.siteStream.entityId = yamlDoc.siteStream?.entityId?.toString();
      return yamlDoc.siteStream;
    }
  }

  return;
};

/**
 * Converts the deprecated format of a siteStream specified in site-stream.json into
 * the format of a siteStream specified in config.yaml
 */
export const formatSiteStream = (sitesJson: Stream, siteStreamPath: string): SiteStream => {
  let entityId;
  if (sitesJson.filter?.entityIds && sitesJson.filter?.entityIds.length === 1) {
    entityId = sitesJson.filter.entityIds[0];
  } else if (sitesJson.filter?.entityIds) {
    logErrorAndExit(`Unable to migrate ${siteStreamPath} due to multiple entityIds`);
  }

  return {
    id: sitesJson.$id, // Replace $id with id and keeps id in the first position
    entityId: entityId?.toString() || "",
    localization: sitesJson.localization,
    fields: sitesJson.fields,
  };
};
