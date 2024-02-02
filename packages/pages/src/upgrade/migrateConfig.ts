import path from "path";
import fs from "fs";
import yaml from "yaml";
import { ProjectStructure } from "../common/src/project/structure.js";
import { logErrorAndExit } from "../util/logError.js";

type BuildConfiguration = {
  buildCommand: string;
  installDependenciesStep?: {
    command: string;
    requiredFiles: string[];
  };
};

type LivePreviewConfiguration = {
  setupCommand: string;
  serveCommand: string;
  watchCommand: string;
};

export const readJsonSync = (jsonPath: string): any => {
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (e) {
    console.error(`unable to parse ${jsonPath}: ${(e as Error).message}`);
    return null;
  }
};

const writeYamlSync = (configYamlPath: string, target: string, data: any) => {
  const yamlDoc = yaml.parseDocument(fs.readFileSync(configYamlPath, "utf-8"));
  yamlDoc.set(target, data);
  fs.writeFileSync(configYamlPath, yaml.stringify(yamlDoc));
};

const migrateCiJson = async (configYamlPath: string, ciPath: string) => {
  const ciJson = readJsonSync(ciPath);
  if (ciJson !== null) {
    const buildArtifacts = ciJson.buildArtifacts;
    if (buildArtifacts) {
      console.info(
        `migrating buildArtifacts from ${ciPath} to ${configYamlPath}`
      );
      const buildConfiguration: BuildConfiguration = {
        buildCommand: buildArtifacts.buildCmd?.replace("build:local", "build"),
      };
      const dependencies = ciJson.dependencies;
      if (dependencies) {
        console.info(
          `migrating dependencies from ${ciPath} to ${configYamlPath}`
        );
        buildConfiguration.installDependenciesStep = {
          command: dependencies.installDepsCmd,
          requiredFiles: dependencies.requiredFiles,
        };
      }
      writeYamlSync(configYamlPath, "buildConfiguration", buildConfiguration);
    }
    const livePreview = ciJson.livePreview;
    if (livePreview) {
      console.info(`migrating livePreview from ${ciPath} to ${configYamlPath}`);
      const livePreviewConfiguration: LivePreviewConfiguration = {
        setupCommand: livePreview.serveSetupCmd,
        serveCommand: livePreview.serveCmd,
        watchCommand: livePreview.watchCmd,
      };
      writeYamlSync(
        configYamlPath,
        "livePreviewConfiguration",
        livePreviewConfiguration
      );
    }
  }
};

const migrateLocales = async (configYamlPath: string, featuresPath: string) => {
  const featuresJson = readJsonSync(featuresPath);
  if (!!featuresJson && !!featuresJson.locales) {
    console.info(`migrating locales from ${featuresPath} to ${configYamlPath}`);
    writeYamlSync(configYamlPath, "locales", featuresJson.locales);
  }
};

const migrateSiteStream = async (
  configYamlPath: string,
  siteStreamPath: string
) => {
  const sitesJson = readJsonSync(siteStreamPath);
  if (sitesJson !== null) {
    console.info(
      `migrating global data from ${siteStreamPath} to ${configYamlPath}`
    );
    const newSiteStream = formatSiteStream(sitesJson, siteStreamPath);
    writeYamlSync(configYamlPath, "siteStream", newSiteStream);
  }
};

export const formatSiteStream = (sitesJson: any, siteStreamPath: string) => {
  let entityId;
  if (sitesJson.filter?.entityIds && sitesJson.filter?.entityIds.length === 1) {
    entityId = sitesJson.filter.entityIds[0];
  } else if (sitesJson.filter?.entityIds) {
    logErrorAndExit(
      `Unable to migrate ${siteStreamPath} due to multiple entityIds`
    );
  }

  return {
    id: sitesJson.$id, // Replace $id with id and keeps id in the first position
    entityId: entityId,
    localization: sitesJson.localization,
    fields: sitesJson.fields,
  };
};

const migrateRedirects = async (source: string, dest: string) => {
  if (fs.existsSync(source)) {
    console.info(`migrating redirects from ${source} to ${dest}`);
    fs.copyFileSync(source, dest);
  }
};

const migrateServing = async (configYamlPath: string, servingPath: string) => {
  const servingJson = readJsonSync(servingPath);
  if (servingJson !== null) {
    const newServingJson = formatServing(servingJson);
    if (newServingJson) {
      console.info(
        `migrating reverse proxy info from ${servingPath} to ${configYamlPath}`
      );
      writeYamlSync(configYamlPath, "serving", newServingJson);
    }
  }
};

export const formatServing = (servingJson: any) => {
  if (servingJson.displayUrlPrefix) {
    return { reverseProxyPrefix: servingJson.displayUrlPrefix };
  }
};

const migrateSiteMap = async (configYamlPath: string, sitemapPath: string) => {
  const sitemapJson = readJsonSync(sitemapPath);
  if (sitemapJson !== null) {
    console.info(`migrating site map from ${sitemapPath} to ${configYamlPath}`);
    writeYamlSync(configYamlPath, "sitemap", sitemapJson);
  }
};

const migrateAuth = async (configYamlPath: string, authPath: string) => {
  const authJson = readJsonSync(authPath);
  if (authJson !== null) {
    console.info(`migrating auth info from ${authPath} to ${configYamlPath}`);
    writeYamlSync(configYamlPath, "authorization", authJson);
  }
};

/**
 * Migrates configuration files from sites-config to config.yaml
 * @param projectStructure
 */
export const migrateConfigs = async (projectStructure: ProjectStructure) => {
  const scope = projectStructure.config.scope || "";
  const sitesConfigPath = projectStructure
    .getSitesConfigPath()
    .getAbsolutePath();
  if (!fs.existsSync(sitesConfigPath)) {
    console.info("sites-config folder not found, nothing to migrate");
    return;
  }
  // migrate child scopes first
  const files = fs.readdirSync(sitesConfigPath, { recursive: false });
  for (const file of files) {
    const filePath = path.resolve(sitesConfigPath, file.toString());
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      await migrateConfigs(
        await ProjectStructure.init({
          scope: path.join(scope, file.toString()),
        })
      );
    }
  }
  const sitesConfigFiles = projectStructure.config.sitesConfigFiles;
  const scopeFolder = path.resolve(scope);
  if (scope) {
    if (!fs.existsSync(scopeFolder)) {
      console.log(`creating scope folder for config at ${scopeFolder}`);
      fs.mkdirSync(scopeFolder, { recursive: true });
    }
  }
  const configYamlPath = path.resolve(
    scopeFolder,
    projectStructure.config.rootFiles.config
  );
  if (!fs.existsSync(configYamlPath)) {
    console.info(`${configYamlPath} does not exist, creating it`);
    fs.writeFileSync(configYamlPath, "");
  }
  await migrateCiJson(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.ci)
  );
  await migrateLocales(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.features)
  );
  await migrateSiteStream(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.siteStream)
  );
  await migrateServing(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.serving)
  );
  await migrateRedirects(
    path.resolve(sitesConfigPath, sitesConfigFiles.redirects),
    path.resolve(scopeFolder, sitesConfigFiles.redirects)
  );
  await migrateSiteMap(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.sitemap)
  );
  await migrateAuth(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.auth)
  );
  // cleanup old sites-config
  fs.rmSync(sitesConfigPath, { force: true, recursive: true });
};
