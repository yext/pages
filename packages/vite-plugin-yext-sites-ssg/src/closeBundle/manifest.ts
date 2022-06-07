import fs from "fs-extra";
import { ProjectStructure } from "../../../common/src/project/structure.js";

/**
 * Creates a manifest.json for use with the Yext Sites plugin
 * @param featureNameToBundlePath a mapping of featureName to bundle paths registered to that
 * feature.
 */
export const generateManifestFile = (
  featureNameToBundlePath: Map<string, string>,
  projectStructure: ProjectStructure
): void => {
  const distRoot = projectStructure.getAbsolutePath("distRoot");
  const relativeBundlePaths = Array.from(featureNameToBundlePath.entries()).map(
    ([name, path]) => [name, projectStructure.getRelativePath("distRoot", path)]
  );

  let bundlerManifest = Buffer.from("{}");
  if (fs.existsSync(`${distRoot}/manifest.json`)) {
    bundlerManifest = fs.readFileSync(`${distRoot}/manifest.json`);
  }
  const manifest = {
    bundlePaths: Object.fromEntries(relativeBundlePaths),
    bundlerManifest: JSON.parse(bundlerManifest.toString()),
  };

  if (!fs.existsSync(`${distRoot}/plugin`)) {
    fs.mkdirSync(`${distRoot}/plugin`);
  }
  fs.writeFileSync(
    `${distRoot}/plugin/manifest.json`,
    JSON.stringify(manifest, null, "  ")
  );

  fs.remove(`${distRoot}/manifest.json`);
};
