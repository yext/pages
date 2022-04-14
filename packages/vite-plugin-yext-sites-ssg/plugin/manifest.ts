import manifest from "./manifest.json" assert { type: "json" };

export type Manifest = {
  // A map of feature name to the bundle path of the feature.
  bundlePaths: {
    [key: string]: string;
  };
  // If the bundler used generates a manifest.json then this field will contain that json object.
  bundlerManifest?: any;
};

export const loadManifest = (): Manifest => {
    return manifest;
}