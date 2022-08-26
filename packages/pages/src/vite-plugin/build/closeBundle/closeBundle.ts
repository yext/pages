import glob from "glob";
import * as path from "path";
import logger from "../../log.js";
import { generateManifestFile } from "./manifest.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import colors from "picocolors";
import { validateBundles } from "./bundleValidator.js";
import {
  loadTemplateModules,
  TemplateModuleCollection,
} from "../../../common/src/template/internal/loader.js";
import { createFeaturesJson } from "../../../generate/features.js";

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
      templateModules = await loadTemplateModules(serverBundles, false, true);
      validateBundles();
      finisher.succeed("Validated template modules");
    } catch (e: any) {
      finisher.fail("One or more template modules failed validation");
      console.error(colors.red(e.message));
      return;
    }

    finisher = logger.timedLog({ startLog: "Writing features.json" });
    try {
      createFeaturesJson(
        templateModules,
        path.join("./sites-config/features.json")
      );
      finisher.succeed("Successfully wrote features.json");
    } catch (e: any) {
      finisher.fail("Failed to write features.json");
      console.error(colors.red(e.message));
      return;
    }

    finisher = logger.timedLog({ startLog: "Writing manifest.json" });
    try {
      await generateManifestFile(templateModules, projectStructure);
      finisher.succeed("Successfully wrote manifest.json");
    } catch (e: any) {
      finisher.fail("Failed to write manifest.json");
      console.error(colors.red(e.message));
      return;
    }
  };
};
