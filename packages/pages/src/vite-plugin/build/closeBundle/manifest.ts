import fs from "fs-extra";
import path from "path";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import { Manifest } from "../../../common/src/template/types.js";
import { glob } from "glob";
import { Path } from "../../../common/src/project/path.js";
import {
  TemplateModuleCollection,
  loadTemplateModules,
} from "../../../common/src/template/loader/loader.js";

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

  // Add the renderPaths to the manifest. This defines the _client and _server entries.
  const renderPaths = glob.sync(
    convertToPosixPath(
      path.resolve(
        projectStructure.config.rootFolders.dist,
        projectStructure.config.subfolders.assets,
        projectStructure.config.subfolders.renderBundle,
        "**/*.js"
      )
    )
  );

  const relativeRenderPaths = renderPaths.map((filepath) => [
    path.parse(filepath).name.split(".")[0], // get the name of the file without the hash or extension
    convertToPosixPath(distPath.getRelativePath(filepath)),
  ]);

  let bundlerManifest = Buffer.from("{}");
  if (fs.existsSync(path.join(distPath.path, "manifest.json"))) {
    bundlerManifest = fs.readFileSync(
      path.join(distPath.path, "manifest.json")
    );
  }
  const manifest: Manifest = {
    serverPaths: Object.fromEntries(relativeBundlePaths),
    clientPaths: Object.fromEntries(await getClientPaths(projectStructure)),
    renderPaths: Object.fromEntries(relativeRenderPaths),
    projectStructure: projectStructure.config,
    bundlerManifest: JSON.parse(bundlerManifest.toString()),
  };

  writeFile(
    path.resolve(distPath.path, "plugin", "manifest.json"),
    JSON.stringify(manifest, null, "  ")
  );

  fs.remove(path.resolve(distPath.path, "manifest.json"));
};

const getClientPaths = async (projectStructure: ProjectStructure) => {
  const clientBundle = glob.sync(
    convertToPosixPath(
      path.join(
        path.resolve(
          projectStructure.config.rootFolders.dist,
          projectStructure.config.subfolders.assets,
          projectStructure.config.subfolders.clientBundle
        ),
        "**/*.js"
      )
    ),
    {
      ignore: path.join(
        path.resolve(
          projectStructure.config.rootFolders.dist,
          projectStructure.config.subfolders.serverlessFunctions
        ),
        "**"
      ),
    }
  );
  const importedModules = await loadTemplateModules(
    clientBundle,
    false,
    true,
    projectStructure
  );
  const featureNameToBundlePath = new Map();
  for (const [featureName, module] of importedModules.entries()) {
    featureNameToBundlePath.set(featureName, module.path);
  }

  const distPath = new Path(projectStructure.config.rootFolders.dist);
  return Array.from(featureNameToBundlePath.entries()).map(([name, path]) => [
    name,
    convertToPosixPath(distPath.getRelativePath(path)),
  ]);
};

// writeFile ensures that the directory of the filepath exists before writing the file.
const writeFile = (filepath: string, contents: string) => {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, contents);
};
