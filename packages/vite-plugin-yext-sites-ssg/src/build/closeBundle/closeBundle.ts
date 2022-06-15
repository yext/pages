import glob from "glob";
import * as path from "path";
import { createFeatureJson } from "./feature.js";
import logger from "../../log.js";
import { generateManifestFile } from "./manifest.js";
import {
  loadTemplateModules,
  TemplateModuleCollection,
} from "./moduleLoader.js";
import { ProjectStructure } from "../../../../common/src/project/structure.js";

export default (projectStructure: ProjectStructure) => {
  return async () => {
    let finisher = logger.timedLog({ startLog: "Validating template modules" });
    let templateModules: TemplateModuleCollection;
    try {
      const serverBundles = glob.sync(
        path.join(
          projectStructure.serverBundleOutputRoot.getAbsolutePath(),
          "**/*.js"
        )
      );
      templateModules = await loadTemplateModules(serverBundles);
      finisher.succeed("Validated template modules");
    } catch (e) {
      finisher.fail("One or more template modules failed validation");
      console.error(e);
      return;
    }

    const sitesConfigRoot = projectStructure.sitesConfigRoot.getAbsolutePath();
    finisher = logger.timedLog({ startLog: `Writing ${sitesConfigRoot}` });
    let featureNameToBundlePath: Map<string, string>;
    try {
      featureNameToBundlePath = await createFeatureJson(
        templateModules,
        path.join(sitesConfigRoot, projectStructure.featuresConfig)
      );
      finisher.succeed(`Successfully wrote ${sitesConfigRoot}`);
    } catch (e) {
      finisher.fail(`Failed to write ${sitesConfigRoot}`);
      console.error(e);
      return;
    }

    finisher = logger.timedLog({ startLog: "Writing manifest.json" });
    try {
      await generateManifestFile(featureNameToBundlePath, projectStructure);
      finisher.succeed("Successfully wrote manifest.json");
    } catch (e) {
      finisher.fail("Failed to write manifest.json");
      console.error(e);
    }
  };
};
