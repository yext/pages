import fs from "node:fs";
import path from "node:path";
import { Node, ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import YAML from "yaml";
import logger from "../vite-plugin/log.js";

export interface ReverseProxyOverride {
  reverseProxyPrefix: string;
  assetsDir: string;
  dynamicRoute: {
    from: string;
    to: string;
    status: number;
  };
}

/**
 * Parses a reverse proxy prefix into the concrete build-time values needed to
 * update config.yaml and vite.config.js.
 */
export const buildReverseProxyOverride = (reverseProxyPrefix: string): ReverseProxyOverride => {
  const firstSlashIndex = reverseProxyPrefix.indexOf("/");
  if (firstSlashIndex === -1) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected a host and subpath like "www.brand.com/locations".`
    );
  }

  const subpath = reverseProxyPrefix.substring(firstSlashIndex + 1);
  if (!subpath) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected a non-empty subpath after the first slash.`
    );
  }

  return {
    reverseProxyPrefix,
    assetsDir: `${subpath}/assets`,
    dynamicRoute: {
      from: "/assets/*",
      to: `/${subpath}/assets/:splat`,
      status: 200,
    },
  };
};

/**
 * Updates the scoped config.yaml and vite.config.js files that the build will
 * read so the normal build pipeline picks up the reverse proxy override.
 */
export const applyReverseProxyOverride = (
  scope: string | undefined,
  reverseProxyPrefix: string
): void => {
  const finisher = logger.timedLog({
    startLog: "Applying reverse proxy override",
  });
  const reverseProxyBuildOverride = buildReverseProxyOverride(reverseProxyPrefix);
  const configYamlPath = path.resolve(scope ?? "", "config.yaml");
  const viteConfigPath = path.resolve(scope ?? "", "vite.config.js");

  if (!fs.existsSync(configYamlPath)) {
    throw new Error(`Cannot apply reverseProxyPrefix because ${configYamlPath} does not exist.`);
  }

  if (!fs.existsSync(viteConfigPath)) {
    throw new Error(`Cannot apply reverseProxyPrefix because ${viteConfigPath} does not exist.`);
  }

  updateConfigYaml(configYamlPath, reverseProxyBuildOverride);
  updateViteConfig(viteConfigPath, reverseProxyBuildOverride.assetsDir);
  finisher.succeed(
    scope
      ? `Applied reverse proxy override for ${scope}: ${reverseProxyBuildOverride.reverseProxyPrefix}`
      : `Applied reverse proxy override: ${reverseProxyBuildOverride.reverseProxyPrefix}`
  );
};

/**
 * Updates config.yaml in place with the provided reverse proxy serving settings.
 * Existing unrelated config fields and routes are preserved.
 */
export const updateConfigYaml = (
  configYamlPath: string,
  reverseProxyBuildOverride: ReverseProxyOverride
): void => {
  const finisher = logger.timedLog({
    startLog: "Updating config.yaml",
  });
  const configYamlDoc = YAML.parseDocument(fs.readFileSync(configYamlPath, "utf-8"));
  if (configYamlDoc.errors.length > 0) {
    throw new Error(
      `Cannot update ${configYamlPath}. Failed to parse config.yaml: ${configYamlDoc.errors[0]?.message}`
    );
  }

  if (!configYamlDoc.contents) {
    configYamlDoc.contents = YAML.createNode({});
  }

  const servingNode = configYamlDoc.get("serving", true);
  if (servingNode && !YAML.isMap(servingNode)) {
    throw new Error(`Cannot update ${configYamlPath}. Expected serving to be a YAML mapping.`);
  }

  if (!servingNode) {
    configYamlDoc.set("serving", {});
  }

  configYamlDoc.setIn(
    ["serving", "reverseProxyPrefix"],
    reverseProxyBuildOverride.reverseProxyPrefix
  );

  const routeToWrite = {
    from: reverseProxyBuildOverride.dynamicRoute.from,
    to: reverseProxyBuildOverride.dynamicRoute.to,
    status: reverseProxyBuildOverride.dynamicRoute.status,
  };
  const dynamicRoutesNode = configYamlDoc.get("dynamicRoutes", true);
  if (dynamicRoutesNode && !YAML.isSeq(dynamicRoutesNode)) {
    throw new Error(`Cannot update ${configYamlPath}. Expected dynamicRoutes to be a YAML list.`);
  }

  if (!dynamicRoutesNode) {
    configYamlDoc.set("dynamicRoutes", [routeToWrite]);
  } else {
    const reverseProxyRouteIndex = dynamicRoutesNode.items.findIndex((routeNode) => {
      return YAML.isMap(routeNode) && routeNode.get("from", true)?.toJSON() === routeToWrite.from;
    });

    if (reverseProxyRouteIndex === -1) {
      dynamicRoutesNode.add(routeToWrite);
    } else {
      dynamicRoutesNode.set(reverseProxyRouteIndex, routeToWrite);
    }
  }

  fs.writeFileSync(configYamlPath, configYamlDoc.toString());
  finisher.succeed(
    `Updated ${path.relative(process.cwd(), configYamlPath) || "config.yaml"} for ${reverseProxyBuildOverride.reverseProxyPrefix}`
  );
};

/**
 * Updates vite.config.js in place so build.assetsDir matches the reverse proxy
 * asset path. The file must export a config object directly or via defineConfig.
 */
export const updateViteConfig = (viteConfigPath: string, assetsDir: string): void => {
  const finisher = logger.timedLog({
    startLog: "Updating vite.config.js",
  });
  const project = new Project({
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
  });
  const sourceFile = project.addSourceFileAtPath(viteConfigPath);
  const exportAssignment = sourceFile.getExportAssignment((value) => !value.isExportEquals());

  if (!exportAssignment) {
    throw new Error(
      `Cannot update ${viteConfigPath}. Expected the file to export a Vite config object.`
    );
  }

  const exportExpression = exportAssignment.getExpression();
  let configObject: ObjectLiteralExpression | undefined;

  if (Node.isCallExpression(exportExpression)) {
    configObject = exportExpression.getArguments().find((argument) => {
      return Node.isObjectLiteralExpression(argument);
    }) as ObjectLiteralExpression | undefined;
  } else if (Node.isObjectLiteralExpression(exportExpression)) {
    configObject = exportExpression;
  }

  if (!configObject) {
    throw new Error(
      `Cannot update ${viteConfigPath}. Expected export default defineConfig({ ... }) or export default { ... }.`
    );
  }

  const buildProperty = configObject.getProperty("build");
  if (!buildProperty) {
    configObject.addPropertyAssignment({
      name: "build",
      initializer: `{
    assetsDir: "${assetsDir}"
  }`,
    });
  } else if (!buildProperty.isKind(SyntaxKind.PropertyAssignment)) {
    throw new Error(`Cannot update ${viteConfigPath}. Expected build to be a property assignment.`);
  } else {
    const buildObject = buildProperty.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    if (!buildObject) {
      throw new Error(`Cannot update ${viteConfigPath}. Expected build to be an object literal.`);
    }

    const assetsDirProperty = buildObject.getProperty("assetsDir");
    if (!assetsDirProperty) {
      buildObject.addPropertyAssignment({
        name: "assetsDir",
        initializer: `"${assetsDir}"`,
      });
    } else if (!assetsDirProperty.isKind(SyntaxKind.PropertyAssignment)) {
      throw new Error(
        `Cannot update ${viteConfigPath}. Expected build.assetsDir to be a property assignment.`
      );
    } else {
      assetsDirProperty.setInitializer(`"${assetsDir}"`);
    }
  }

  sourceFile.formatText();
  sourceFile.saveSync();
  finisher.succeed(
    `Updated ${path.relative(process.cwd(), viteConfigPath) || "vite.config.js"} with build.assetsDir=${assetsDir}`
  );
};
