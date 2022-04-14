import fs from "fs-extra";
import {Paths} from "../paths.js";

/**
 * Creates a manifest.json for use with the Yext Sites plugin
 * @param featureNameToBundlePath a mapping of featureName to bundle paths registered to that
 * feature.
 */
export const generateManifestFile = (
  featureNameToBundlePath: Map<string, string>,
  { distDir, yextDir, rootPath }: Paths
): void => {
  const relativeBundlePaths = Array.from(featureNameToBundlePath.entries()).map(
    ([name, path]) => [name, rootPath(path)]
  );

  let bundlerManifest = Buffer.from("{}");
  if (fs.existsSync(`${distDir}/manifest.json`)) {
    bundlerManifest = fs.readFileSync(`${distDir}/manifest.json`);
  }
  const manifest = {
    bundlePaths: Object.fromEntries(relativeBundlePaths),
    bundlerManifest: JSON.parse(bundlerManifest.toString()),
  };

  fs.writeFileSync(
    `${yextDir}/manifest.json`,
    JSON.stringify(manifest, null, "  ")
  );
};
