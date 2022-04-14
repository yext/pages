import * as path from "path";

const fileUrl = new URL("http://www.example.com");
const __dirname = path.dirname(fileUrl.pathname);

/**
 * Creates an absolute filepath by evaluating a path relative to the YextJS executable.
 * @param relativePath: A file path relative to the root of the site repo.
 */
const resolvePath = (relativePath: string): string => {
  return path.resolve(__dirname, path.relative(__dirname, relativePath));
};

// Path Defaults
const templatePath = "./src/templates";
const yextPath = "./.yext";
const hydrationOut = `${yextPath}/hydration_templates`;
let featureJson = "./sites-config/features.json";
const distPath = "./dist";
const serverBundleOut = `${distPath}/assets/server`;

/**
 * Creates a filepath relative to the generated manifest.json, which lives under .yext
 * @param filePath: an absolute filepath
 */
const manifestPath = (filePath: string): string =>
  `./${path.relative(yextPath, filePath)}`;

const rootPath = (filePath: string): string =>
  `./${path.relative("./", filePath)}`;

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
  const yextDir = resolvePath(yextPath);
  const hydrationOutputDir = resolvePath(hydrationOut);
  const hydrationBundleOutputDir = resolvePath(`${distPath}/hydration`);
  const serverBundleOutputDir = resolvePath(serverBundleOut);
  const featureJsonDir = resolvePath(featureJson);
  const distDir = resolvePath(distPath);
  return {
    resolvePath,
    templateDir,
    yextDir,
    hydrationBundleOutputDir,
    hydrationOutputDir,
    serverBundleOutputDir,
    featureJsonDir,
    distDir,
    manifestPath,
    rootPath,
  };
};

export type Paths = {
  resolvePath: (string) => string;
  templateDir: string;
  yextDir: string;
  hydrationBundleOutputDir: string;
  hydrationOutputDir: string;
  serverBundleOutputDir: string;
  featureJsonDir: string;
  distDir: string;
  manifestPath: (string) => string;
  rootPath: (string) => string;
};
