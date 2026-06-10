import fs from "node:fs";
import path from "node:path";
import { Node, ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import YAML from "yaml";
import { ProjectStructure } from "../common/src/project/structure.js";
import logger from "../vite-plugin/log.js";

type ReverseProxyOverride = {
  reverseProxyPrefix: string;
  assetsDir: string;
  dynamicRoute: {
    from: string;
    to: string;
    status: number;
  };
};

/**
 * Parses a reverse proxy prefix into the concrete build-time values needed to
 * update config.yaml and vite.config.js.
 */
export const buildReverseProxyOverride = (reverseProxyPrefix: string): ReverseProxyOverride => {
  const trimmedReverseProxyPrefix = reverseProxyPrefix.trim();
  if (trimmedReverseProxyPrefix.includes("://")) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Do not include a protocol. Expected a host and subpath like "www.brand.com/locations".`
    );
  }

  if (!trimmedReverseProxyPrefix.includes("/")) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected a host and subpath like "www.brand.com/locations".`
    );
  }

  const subpathAfterHost = trimmedReverseProxyPrefix.substring(
    trimmedReverseProxyPrefix.indexOf("/") + 1
  );
  const normalizedPathSegments = subpathAfterHost
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        throw new Error(
          `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected valid percent-encoding in the subpath.`
        );
      }
    });

  const subpath = normalizedPathSegments.join("/");
  if (!subpath) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected a non-empty subpath after the host.`
    );
  }

  if (!normalizedPathSegments.every((segment) => /^[A-Za-z0-9_-]+$/.test(segment))) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected the subpath to contain only letters, numbers, "-", "_", and "/".`
    );
  }

  return {
    reverseProxyPrefix: trimmedReverseProxyPrefix,
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
  projectStructure: ProjectStructure,
  reverseProxyPrefix: string
): void => {
  const finisher = logger.timedLog({
    startLog: "Applying reverse proxy override",
  });
  const reverseProxyOverride = buildReverseProxyOverride(reverseProxyPrefix);
  const configYamlPath = projectStructure.getConfigYamlPath().getAbsolutePath();
  const viteConfigPath = projectStructure.getViteConfigPath()?.getAbsolutePath();
  const scope = projectStructure.config.scope;

  if (!fs.existsSync(configYamlPath)) {
    throw new Error(`Cannot apply reverseProxyPrefix because ${configYamlPath} does not exist.`);
  }

  if (!viteConfigPath || !fs.existsSync(viteConfigPath)) {
    throw new Error(`Cannot apply reverseProxyPrefix because ${viteConfigPath} does not exist.`);
  }

  updateConfigYaml(configYamlPath, reverseProxyOverride);
  updateViteConfig(viteConfigPath, reverseProxyOverride.assetsDir);
  finisher.succeed(
    scope
      ? `Applied reverse proxy override for ${scope}: ${reverseProxyOverride.reverseProxyPrefix}`
      : `Applied reverse proxy override: ${reverseProxyOverride.reverseProxyPrefix}`
  );
};

/**
 * Updates config.yaml in place with the provided reverse proxy serving settings.
 * Existing unrelated config fields and routes are preserved.
 */
export const updateConfigYaml = (
  configYamlPath: string,
  reverseProxyOverride: ReverseProxyOverride
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
    configYamlDoc.contents = YAML.parseDocument("{}").contents;
  }

  const servingNode = configYamlDoc.get("serving", true);
  if (servingNode && !YAML.isMap(servingNode)) {
    throw new Error(`Cannot update ${configYamlPath}. Expected serving to be a YAML mapping.`);
  }

  if (!servingNode) {
    configYamlDoc.set("serving", {
      reverseProxyPrefix: reverseProxyOverride.reverseProxyPrefix,
    });
  } else {
    (servingNode as YAML.YAMLMap<unknown, unknown>).set(
      "reverseProxyPrefix",
      reverseProxyOverride.reverseProxyPrefix
    );
  }

  const routeToWrite = {
    from: reverseProxyOverride.dynamicRoute.from,
    to: reverseProxyOverride.dynamicRoute.to,
    status: reverseProxyOverride.dynamicRoute.status,
  };
  const dynamicRoutesNode = configYamlDoc.get("dynamicRoutes", true);
  if (dynamicRoutesNode && !YAML.isSeq(dynamicRoutesNode)) {
    throw new Error(`Cannot update ${configYamlPath}. Expected dynamicRoutes to be a YAML list.`);
  }

  if (!dynamicRoutesNode) {
    configYamlDoc.set("dynamicRoutes", [routeToWrite]);
  } else {
    const dynamicRoutesSeq = dynamicRoutesNode as YAML.YAMLSeq<unknown>;
    const reverseProxyRouteIndex = dynamicRoutesSeq.items.findIndex((routeNode: unknown) => {
      return YAML.isMap(routeNode) && routeNode.get("from", true)?.toJSON() === routeToWrite.from;
    });

    if (reverseProxyRouteIndex === -1) {
      dynamicRoutesSeq.add(routeToWrite);
    } else {
      dynamicRoutesSeq.set(reverseProxyRouteIndex, routeToWrite);
    }
  }

  fs.writeFileSync(configYamlPath, configYamlDoc.toString());
  finisher.succeed(
    `Updated ${path.relative(process.cwd(), configYamlPath) || "config.yaml"} for ${reverseProxyOverride.reverseProxyPrefix}`
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
