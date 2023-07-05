import fs from "fs-extra";
import path from "path";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { TemplateModuleCollection } from "../../../common/src/template/internal/loader.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import { Manifest } from "../../../common/src/template/types.js";
import { glob } from "glob";

/**
 * Creates a manifest.json for use with the Pages vite-plugin
 * @param featureNameToBundlePath a mapping of featureName to bundle paths registered to that
 * feature.
 */
export const generateManifestFile = (
  templateModules: TemplateModuleCollection,
  projectStructure: ProjectStructure,
): void => {
  const featureNameToBundlePath = new Map();
  for (const [featureName, module] of templateModules.entries()) {
    featureNameToBundlePath.set(featureName, module.path);
  }

  const distRoot = projectStructure.distRoot.getAbsolutePath();
  const relativeBundlePaths = Array.from(featureNameToBundlePath.entries()).map(
    ([name, path]) => [
      name,
      convertToPosixPath(projectStructure.distRoot.getRelativePath(path)),
    ],
  );

  // Add the renderPaths to the manifest. This defines the _client and _server entries.
  const renderPaths = glob.sync(
    path.join(
      projectStructure.renderBundleOutputRoot.getAbsolutePath(),
      "**/*.js",
    ),
  );

  const relativeRenderPaths = renderPaths.map((filepath) => [
    path.parse(filepath).name.split(".")[0], // get the name of the file without the hash or extension
    convertToPosixPath(projectStructure.distRoot.getRelativePath(filepath)),
  ]);

  let bundlerManifest = Buffer.from("{}");
  if (fs.existsSync(path.join(distRoot, "manifest.json"))) {
    bundlerManifest = fs.readFileSync(path.join(distRoot, "manifest.json"));
  }
  const manifest: Manifest = {
    bundlePaths: Object.fromEntries(relativeBundlePaths),
    renderPaths: Object.fromEntries(relativeRenderPaths),
    projectFilepaths: {
      templatesRoot: projectStructure.templatesRoot.path,
      distRoot: projectStructure.distRoot.path,
      serverBundleOutputRoot: projectStructure.serverBundleOutputRoot.path,
      scopedTemplatesPath: projectStructure.scopedTemplatesPath?.path,
    },
    bundlerManifest: JSON.parse(bundlerManifest.toString()),
  };

  writeFile(
    path.join(distRoot, "plugin", "manifest.json"),
    JSON.stringify(manifest, null, "  "),
  );

  fs.remove(path.join(distRoot, "manifest.json"));
};

// writeFile ensures that the directory of the filepath exists before writing the file.
const writeFile = (filepath: string, contents: string) => {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, contents);
};
