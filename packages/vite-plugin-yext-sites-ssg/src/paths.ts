import * as path from "path";

/**
 * Creates an absolute filepath by evaluating a path relative to the YextJS executable.
 * @param relativePath: A file path relative to the root of the site repo.
 */
const resolvePath = (relativePath: string): string => {
  return path.resolve(relativePath);
};

// Starter Path Defaults
const templatePath = "./src/templates";
const distPath = "./dist";
const hydrationOut = `${resolvePath(distPath)}/hydration_templates`;
let featureJson = "./sites-config/features.json";
const serverBundleOut = `${distPath}/assets/server`;

/**
 * Creates a filepath relative to the generated manifest.json, which lives under .yext
 * @param filePath: an absolute filepath
 */
const manifestPath = (filePath: string): string =>
  `./${path.relative(distPath, filePath)}`;

const rootPath = (filePath: string): string =>
  `./${path.relative("./", filePath)}`;

const serverBundlePath = (filePath: string): string =>
  `./${path.relative(distPath, filePath)}`;

declare type PathOptions = {
  /**
   * The path to output the feature.json to. By default, this is sites-config/feature.json.
   */
  featuresOut?: string;
};

export default (opts?: PathOptions): Paths => {
  if (opts) {
    if (opts.featuresOut) {
      featureJson = path.join(opts.featuresOut, "features.json");
    }
  }

  const templateDir = resolvePath(templatePath);
  const hydrationOutputDir = resolvePath(hydrationOut);
  const hydrationBundleOutputDir = resolvePath(`${distPath}/hydration`);
  const serverBundleOutputDir = resolvePath(serverBundleOut);
  const featureJsonDir = resolvePath(featureJson);
  const distDir = resolvePath(distPath);
  return {
    resolvePath,
    templateDir,
    hydrationBundleOutputDir,
    hydrationOutputDir,
    serverBundleOutputDir,
    featureJsonDir,
    distDir,
    manifestPath,
    rootPath,
    serverBundlePath,
  };
};

export type Paths = {
  resolvePath: (string) => string;
  templateDir: string;
  hydrationBundleOutputDir: string;
  hydrationOutputDir: string;
  serverBundleOutputDir: string;
  featureJsonDir: string;
  distDir: string;
  manifestPath: (string) => string;
  rootPath: (string) => string;
  serverBundlePath: (string) => string;
};
