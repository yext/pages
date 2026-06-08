import fs from "node:fs";
import YAML from "yaml";
import { processEnvVariables } from "../../../util/processEnvVariables.js";
import { getReverseProxyOverride } from "../../../util/reverseProxyOverride.js";
import { ProjectStructure } from "../project/structure.js";

export interface ConfigYamlData {
  siteStream?: {
    id?: string;
    entityId?: string | number;
    fields?: string[];
    localization?: {
      locales?: string[];
      primary?: true;
    };
    transform?: {
      expandOptionFields?: string[];
      replaceOptionValuesWithDisplayNames?: string[];
    };
    [key: string]: unknown;
  };
  serving?: {
    reverseProxyPrefix?: string;
    [key: string]: unknown;
  };
  dynamicRoutes?: Array<{
    from?: string;
    to?: string;
    status?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

/**
 * Loads config.yaml for the given project structure, substitutes environment variables,
 * and applies any reverse proxy override from the build environment.
 */
export const readConfigYaml = (projectStructure: ProjectStructure): ConfigYamlData | undefined => {
  const configYamlPath = projectStructure.getConfigYamlPath().getAbsolutePath();
  if (!fs.existsSync(configYamlPath)) {
    return;
  }

  const envVars = processEnvVariables(projectStructure.config.envVarConfig.envVarPrefix);
  const parsedConfigYaml = substituteEnvVars(
    YAML.parse(fs.readFileSync(configYamlPath, "utf-8")) ?? {},
    envVars
  ) as ConfigYamlData;
  const reverseProxyOverride = getReverseProxyOverride();
  if (!reverseProxyOverride) {
    return parsedConfigYaml;
  }

  const configYaml = structuredClone(parsedConfigYaml);
  configYaml.serving = {
    ...configYaml.serving,
    reverseProxyPrefix: reverseProxyOverride.reverseProxyPrefix,
  };

  const dynamicRoutes = configYaml.dynamicRoutes ?? [];
  const reverseProxyRouteIndex = dynamicRoutes.findIndex((route) => route.from === "/assets/*");

  if (reverseProxyRouteIndex === -1) {
    configYaml.dynamicRoutes = [...dynamicRoutes, { ...reverseProxyOverride.dynamicRoute }];
    return configYaml;
  }

  configYaml.dynamicRoutes = [...dynamicRoutes];
  configYaml.dynamicRoutes[reverseProxyRouteIndex] = {
    ...configYaml.dynamicRoutes[reverseProxyRouteIndex],
    ...reverseProxyOverride.dynamicRoute,
  };

  return configYaml;
};

/**
 * Recursively traverses config.yaml data and substitutes string values that match keys
 * in the provided environment variable map.
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
    const newConfig: { [key: string]: unknown } = {};
    for (const key in configData) {
      if (Object.prototype.hasOwnProperty.call(configData, key)) {
        newConfig[key] = substituteEnvVars((configData as Record<string, unknown>)[key], envVars);
      }
    }
    return newConfig as T;
  }

  return configData;
};
