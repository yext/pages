import path from "path";
import fs from "fs";
import yaml from "yaml";

function readJsonSync(jsonPath: string): any {
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (e) {
    console.error(`unable to parse ${jsonPath}: ${(e as Error).message}`);
    return null;
  }
}

function writeYamlSync(configYamlPath: string, target: string, data: any) {
  const yamlDoc = yaml.parseDocument(fs.readFileSync(configYamlPath, "utf-8"));
  yamlDoc.set(target, data);
  fs.writeFileSync(configYamlPath, yaml.stringify(yamlDoc));
}

const migrateCiJson = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const ciJson = readJsonSync(path.resolve(sitesConfigPath, "ci.json"));
  if (ciJson !== null) {
    ciJson.artifactStructure = null;
    console.info("migrating site config from ci.json to config.yaml");
    writeYamlSync(configYamlPath, "ciConfig", ciJson);
  }
};

const migrateLocales = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const featuresJson = readJsonSync(
    path.resolve(sitesConfigPath, "features.json")
  );
  if (!!featuresJson && !!featuresJson.locales) {
    console.info("migrating locales from features.json to config.yaml");
    writeYamlSync(configYamlPath, "locales", featuresJson.locales);
  }
};

const migrateSiteStream = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const sitesJson = readJsonSync(
    path.resolve(sitesConfigPath, "site-stream.json")
  );
  if (sitesJson !== null) {
    console.info("migrating global data from site-stream.json to config.yaml");
    writeYamlSync(configYamlPath, "globalData", sitesJson);
  }
};

const migrateRedirects = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const redirectsPath = path.resolve(sitesConfigPath, "redirects.csv");
  if (fs.existsSync(redirectsPath)) {
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

const migrateServing = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const servingJson = readJsonSync(
    path.resolve(sitesConfigPath, "serving.json")
  );
  if (!!servingJson && !!servingJson.displayUrlPrefix) {
    console.info(
      "migrating reverse proxy info from serving.json to config.yaml"
    );
    writeYamlSync(configYamlPath, "reverseProxy", {
      displayUrlPrefix: servingJson.displayUrlPrefix,
    });
  }
};

const migrateSiteMap = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const sitemapJson = readJsonSync(
    path.resolve(sitesConfigPath, "sitemap.json")
  );
  if (sitemapJson !== null) {
    console.info("migrating sitemap from sitemap.json to config.yaml");
    writeYamlSync(configYamlPath, "sitemap", sitemapJson);
  }
};

const migrateAuth = async (configYamlPath: string, sitesConfigPath: string) => {
  const authJson = readJsonSync(path.resolve(sitesConfigPath, "auth.json"));
  if (authJson !== null) {
    console.info("migrating auth info from auth.json to config.yaml");
    writeYamlSync(configYamlPath, "authorization", authJson);
  }
};

export const migrateConfigs = async (target: string) => {
  const sitesConfigPath = path.resolve(target, "sites-config");
  if (!fs.existsSync(sitesConfigPath)) {
    console.info("sites-config folder not found, nothing to migrate");
    return;
  }
  const configYamlPath = path.resolve(target, "config.yaml");
  if (!fs.existsSync(configYamlPath)) {
    console.info("config.yaml does not exist, creating it");
    fs.writeFileSync(configYamlPath, "");
  }
  await migrateCiJson(configYamlPath, sitesConfigPath);
  await migrateLocales(configYamlPath, sitesConfigPath);
  await migrateSiteStream(configYamlPath, sitesConfigPath);
  await migrateServing(configYamlPath, sitesConfigPath);
  await migrateRedirects(configYamlPath, sitesConfigPath);
  await migrateSiteMap(configYamlPath, sitesConfigPath);
  await migrateAuth(configYamlPath, sitesConfigPath);
};
