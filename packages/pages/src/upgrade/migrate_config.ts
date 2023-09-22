import path from "path";
import fs from "fs";
import yaml from "yaml";

const migrateServing = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const servingPath = path.resolve(sitesConfigPath, "serving.json");
  if (fs.existsSync(servingPath)) {
    const servingJson = JSON.parse(fs.readFileSync(servingPath, "utf-8"));
    const displayUrlPrefix = servingJson.displayUrlPrefix;
    if (displayUrlPrefix !== null) {
      console.info(
        "migrating reverse proxy info from serving.json to config.yaml"
      );
      const yamlDoc = yaml.parseDocument(
        fs.readFileSync(configYamlPath, "utf-8")
      );
      yamlDoc.set("reverseProxy", {
        displayUrlPrefix: displayUrlPrefix,
      });
      fs.writeFileSync(configYamlPath, yaml.stringify(yamlDoc));
    }
  }
};

const migrateGlobalData = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const siteStreamPath = path.resolve(sitesConfigPath, "site-stream.json");
  if (fs.existsSync(siteStreamPath)) {
    const sitesJson = JSON.parse(fs.readFileSync(siteStreamPath, "utf-8"));
    console.info("migrating global data from site-stream.json to config.yaml");
    const yamlDoc = yaml.parseDocument(
      fs.readFileSync(configYamlPath, "utf-8")
    );
    yamlDoc.set("globalData", sitesJson);
    fs.writeFileSync(configYamlPath, yaml.stringify(yamlDoc));
  }
};

const migrateSiteMap = async (
  configYamlPath: string,
  sitesConfigPath: string
) => {
  const sitemapPath = path.resolve(sitesConfigPath, "sitemap.json");
  if (fs.existsSync(sitemapPath)) {
    const sitemapJson = JSON.parse(fs.readFileSync(sitemapPath, "utf-8"));
    console.info("migrating sitemap from sitemap.json to config.yaml");
    const yamlDoc = yaml.parseDocument(
      fs.readFileSync(configYamlPath, "utf-8")
    );
    yamlDoc.set("sitemap", sitemapJson);
    fs.writeFileSync(configYamlPath, yaml.stringify(yamlDoc));
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
    console.info("config.yaml does not exist, cannot migrate");
    return;
  }
  await migrateGlobalData(configYamlPath, sitesConfigPath);
  await migrateSiteMap(configYamlPath, sitesConfigPath);
  await migrateServing(configYamlPath, sitesConfigPath);
};
