import path from "path";
import fs from "fs";
import yaml from "yaml";
import { ProjectStructure } from "../common/src/project/structure.js";

const readJsonSync = (jsonPath: string): any => {
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
    ciJson.artifactStructure = undefined;
    console.info("migrating site config from ci.json to config.yaml");
    writeYamlSync(configYamlPath, "ciConfig", ciJson);
  }
};

const migrateLocales = async (configYamlPath: string, featuresPath: string) => {
  const featuresJson = readJsonSync(featuresPath);
  if (!!featuresJson && !!featuresJson.locales) {
    console.info("migrating locales from features.json to config.yaml");
    writeYamlSync(configYamlPath, "locales", featuresJson.locales);
  }
};

const migrateSiteStream = async (
  configYamlPath: string,
  siteStreamPath: string
) => {
  const sitesJson = readJsonSync(siteStreamPath);
  if (sitesJson !== null) {
    console.info("migrating global data from site-stream.json to config.yaml");
    writeYamlSync(configYamlPath, "globalData", sitesJson);
  }
};

const migrateRedirects = async (
  configYamlPath: string,
  redirectsPath: string
) => {
  if (fs.existsSync(redirectsPath)) {
    console.info("migrating redirects from redirects.csv to config.yaml");
    const lines = fs.readFileSync(redirectsPath, "utf-8").split("\n");
    const redirects: any[] = [];
    lines.forEach((line: string) => {
      const s: string[] = line.split(",");
      redirects.push({
        from: s[0],
        to: s[1],
      });
    });
    writeYamlSync(configYamlPath, "redirects", redirects);
  }
};

const migrateServing = async (configYamlPath: string, servingPath: string) => {
  const servingJson = readJsonSync(servingPath);
  if (!!servingJson && !!servingJson.displayUrlPrefix) {
    console.info(
      "migrating reverse proxy info from serving.json to config.yaml"
    );
    writeYamlSync(configYamlPath, "reverseProxy", {
      displayUrlPrefix: servingJson.displayUrlPrefix,
    });
  }
};

const migrateSiteMap = async (configYamlPath: string, sitemapPath: string) => {
  const sitemapJson = readJsonSync(sitemapPath);
  if (sitemapJson !== null) {
    console.info("migrating sitemap from sitemap.json to config.yaml");
    writeYamlSync(configYamlPath, "sitemap", sitemapJson);
  }
};

const migrateAuth = async (configYamlPath: string, authPath: string) => {
  const authJson = readJsonSync(authPath);
  if (authJson !== null) {
    console.info("migrating auth info from auth.json to config.yaml");
    writeYamlSync(configYamlPath, "authorization", authJson);
  }
};

/**
 * Migrates configuration files from sites-config to config.yaml
 * @param projectStructure the structure of the project
 */
export const migrateConfigs = async (projectStructure: ProjectStructure) => {
  const sitesConfigPath = projectStructure
    .getSitesConfigPath()
    .getAbsolutePath();
  const configYamlPath = path.resolve(projectStructure.config.rootFiles.config);
  const sitesConfigFiles = projectStructure.config.sitesConfigFiles;
  if (!fs.existsSync(sitesConfigPath)) {
    console.info("sites-config folder not found, nothing to migrate");
    return;
  }
  if (!fs.existsSync(configYamlPath)) {
    console.info("config.yaml does not exist, creating it");
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
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.redirects)
  );
  await migrateSiteMap(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.sitemap)
  );
  await migrateAuth(
    configYamlPath,
    path.resolve(sitesConfigPath, sitesConfigFiles.auth)
  );
};
