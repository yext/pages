import manifest from "./manifest.json" assert { type: "json" };

export type Manifest = {
  /** A map of feature name to the bundle path of the feature */
  bundlePaths: {
    [key: string]: string;
  };
  /** A map of project roots to their paths */
  projectFilepaths: {
    /** The folder path where the template files live */
    templatesRoot: string;
    /** The folder path where the compiled files live */
    distRoot: string;
    /** The folder path where the compiled hydration bundles live */
    hydrationBundleOutputRoot: string;
    /** The folder path where the compiled server bundles live */
    serverBundleOutputRoot: string;
  };
  /** If the bundler used generates a manifest.json then this field will contain that json object */
  bundlerManifest?: any;
};

export const loadManifest = (): Manifest => {
  return manifest;
};
