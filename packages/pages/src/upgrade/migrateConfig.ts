import path from "path";
import fs from "fs";
import yaml from "yaml";
import { ProjectStructure } from "../common/src/project/structure.js";

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
    ciJson.artifactStructure = undefined;
    console.info(`migrating site config from ${ciPath} to ${configYamlPath}`);
    writeYamlSync(configYamlPath, "ciConfig", ciJson);
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
    // this logic replaces $id with id and keeps id in the first position
    const newSiteStream = {
      id: sitesJson.$id,
      ...sitesJson,
    };
    newSiteStream.$id = undefined;
    writeYamlSync(configYamlPath, "siteStream", newSiteStream);
  }
};

const migrateRedirects = async (source: string, dest: string) => {
  if (fs.existsSync(source)) {
    console.info(`migrating redirects from ${source} to ${dest}`);
    fs.copyFileSync(source, dest);
  }
};

const migrateServing = async (configYamlPath: string, servingPath: string) => {
  const servingJson = readJsonSync(servingPath);
  if (!!servingJson && !!servingJson.displayUrlPrefix) {
    console.info(
      `migrating reverse proxy info from ${servingPath} to ${configYamlPath}`
    );
    writeYamlSync(configYamlPath, "reverseProxy", {
      displayUrlPrefix: servingJson.displayUrlPrefix,
    });
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
 * @param scope
 */
export const migrateConfigs = async (scope: string) => {
  scope = scope || "";
  const projectStructure = await ProjectStructure.init({ scope: scope });
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
      await migrateConfigs(path.join(scope, file.toString()));
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
