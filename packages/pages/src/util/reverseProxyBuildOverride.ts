import fs from "node:fs";
import path from "node:path";
import { Node, ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import YAML from "yaml";
import logger from "../vite-plugin/log.js";

export interface ReverseProxyBuildOverride {
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
export const parseReverseProxyBuildOverride = (
  reverseProxyPrefix: string
): ReverseProxyBuildOverride => {
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
export const applyReverseProxyBuildOverride = (
  scope: string | undefined,
  reverseProxyPrefix: string
): void => {
  const finisher = logger.timedLog({
    startLog: "Applying reverse proxy override",
  });
  const reverseProxyBuildOverride = parseReverseProxyBuildOverride(reverseProxyPrefix);
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
  reverseProxyBuildOverride: ReverseProxyBuildOverride
): void => {
  const finisher = logger.timedLog({
    startLog: "Updating config.yaml",
  });
  const configYaml =
    (YAML.parse(fs.readFileSync(configYamlPath, "utf-8")) as {
      serving?: Record<string, unknown>;
      dynamicRoutes?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    }) ?? {};

  configYaml.serving = {
    ...configYaml.serving,
    reverseProxyPrefix: reverseProxyBuildOverride.reverseProxyPrefix,
  };

  const routeToWrite: Record<string, unknown> = {
    from: reverseProxyBuildOverride.dynamicRoute.from,
    to: reverseProxyBuildOverride.dynamicRoute.to,
    status: reverseProxyBuildOverride.dynamicRoute.status,
  };
  const dynamicRoutes = configYaml.dynamicRoutes ?? [];
  const reverseProxyRouteIndex = dynamicRoutes.findIndex((route) => {
    return route.from === reverseProxyBuildOverride.dynamicRoute.from;
  });

  if (reverseProxyRouteIndex === -1) {
    configYaml.dynamicRoutes = [...dynamicRoutes, routeToWrite];
  } else {
    configYaml.dynamicRoutes = [...dynamicRoutes];
    configYaml.dynamicRoutes[reverseProxyRouteIndex] = {
      ...configYaml.dynamicRoutes[reverseProxyRouteIndex],
      ...routeToWrite,
    };
  }

  fs.writeFileSync(configYamlPath, YAML.stringify(configYaml));
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
    sourceFile.saveSync();
    finisher.succeed(
      `Updated ${path.relative(process.cwd(), viteConfigPath) || "vite.config.js"} with build.assetsDir=${assetsDir}`
    );
    return;
  }

  if (!buildProperty.isKind(SyntaxKind.PropertyAssignment)) {
    throw new Error(`Cannot update ${viteConfigPath}. Expected build to be a property assignment.`);
  }

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
    sourceFile.saveSync();
    finisher.succeed(
      `Updated ${path.relative(process.cwd(), viteConfigPath) || "vite.config.js"} with build.assetsDir=${assetsDir}`
    );
    return;
  }

  if (!assetsDirProperty.isKind(SyntaxKind.PropertyAssignment)) {
    throw new Error(
      `Cannot update ${viteConfigPath}. Expected build.assetsDir to be a property assignment.`
    );
  }

  assetsDirProperty.setInitializer(`"${assetsDir}"`);
  sourceFile.saveSync();
  finisher.succeed(
    `Updated ${path.relative(process.cwd(), viteConfigPath) || "vite.config.js"} with build.assetsDir=${assetsDir}`
  );
};
