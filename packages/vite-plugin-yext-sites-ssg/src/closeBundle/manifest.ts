import fs from "fs-extra";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { Manifest } from "../../../common/src/template/types.js";

/**
 * Creates a manifest.json for use with the Yext Sites plugin
 * @param featureNameToBundlePath a mapping of featureName to bundle paths registered to that
 * feature.
 */
export const generateManifestFile = (
  featureNameToBundlePath: Map<string, string>,
  projectStructure: ProjectStructure
): void => {
  const distRoot = projectStructure.distRoot.getAbsolutePath();
  const relativeBundlePaths = Array.from(featureNameToBundlePath.entries()).map(
    ([name, path]) => [name, projectStructure.distRoot.getRelativePath(path)]
  );

  let bundlerManifest = Buffer.from("{}");
  if (fs.existsSync(`${distRoot}/manifest.json`)) {
    bundlerManifest = fs.readFileSync(`${distRoot}/manifest.json`);
  }
  const manifest: Manifest = {
    bundlePaths: Object.fromEntries(relativeBundlePaths),
    projectFilepaths: {
      templatesRoot: projectStructure.templatesRoot.path,
      distRoot: projectStructure.distRoot.path,
      hydrationBundleOutputRoot:
        projectStructure.hydrationBundleOutputRoot.path,
      serverBundleOutputRoot: projectStructure.serverBundleOutputRoot.path,
    },
    bundlerManifest: JSON.parse(bundlerManifest.toString()),
  };

  fs.writeFileSync(
    `${distRoot}/plugin/manifest.json`,
    JSON.stringify(manifest, null, "  ")
  );

  fs.remove(`${distRoot}/manifest.json`);
};
