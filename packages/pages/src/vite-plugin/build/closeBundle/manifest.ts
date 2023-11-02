import fs from "fs-extra";
import path from "node:path";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import { Manifest } from "../../../common/src/template/types.js";
import { glob } from "glob";
import { Path } from "../../../common/src/project/path.js";
import { TemplateModuleCollection } from "../../../common/src/template/loader/loader.js";

/**
 * Creates a manifest.json for use with the Pages vite-plugin
 * @param featureNameToBundlePath a mapping of featureName to bundle paths registered to that
 * feature.
 */
export const generateManifestFile = async (
  templateModules: TemplateModuleCollection,
  projectStructure: ProjectStructure
): Promise<void> => {
  const featureNameToBundlePath = new Map();
  for (const [featureName, module] of templateModules.entries()) {
    featureNameToBundlePath.set(featureName, module.path);
  }

  const distPath = new Path(projectStructure.config.rootFolders.dist);

  const relativeBundlePaths = Array.from(featureNameToBundlePath.entries()).map(
    ([name, path]) => [name, convertToPosixPath(distPath.getRelativePath(path))]
  );

  //Scans for paths in dist/assets/<assetPath> and finds the paths and file names.
  async function getAssetBundlePaths(assetPath: string): Promise<string[][]> {
    const filePaths = glob.sync(
      convertToPosixPath(
        path.resolve(
          projectStructure.config.rootFolders.dist,
          projectStructure.config.subfolders.assets,
          assetPath,
          "**/*.js"
        )
      )
    );
    return filePaths.map((filepath) => [
      path.parse(filepath).name.split(".")[0],
      convertToPosixPath(distPath.getRelativePath(filepath)),
    ]);
  }

  let bundlerManifest = Buffer.from("{}");
  if (fs.existsSync(path.join(distPath.path, "manifest.json"))) {
    bundlerManifest = fs.readFileSync(
      path.join(distPath.path, "manifest.json")
    );
  }
  const manifest: Manifest = {
    serverPaths: Object.fromEntries(relativeBundlePaths),
    clientPaths: Object.fromEntries(
      await getAssetBundlePaths(projectStructure.config.subfolders.clientBundle)
    ),
    renderPaths: Object.fromEntries(
      await getAssetBundlePaths(projectStructure.config.subfolders.renderBundle)
    ),
    projectStructure: projectStructure.config,
    bundlerManifest: JSON.parse(bundlerManifest.toString()),
  };

  writeFile(
    path.resolve(distPath.path, "plugin", "manifest.json"),
    JSON.stringify(manifest, null, "  ")
  );

  fs.remove(path.resolve(distPath.path, "manifest.json"));
};

// writeFile ensures that the directory of the filepath exists before writing the file.
const writeFile = (filepath: string, contents: string) => {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, contents);
};
