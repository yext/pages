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
import { createFeaturesJson } from "../../../generate/features/createFeaturesJson.js";
import {
  generateFunctionMetadataFile,
  shouldGenerateFunctionMetadata,
} from "./functionMetadata.js";
import { updateCiConfig } from "../../../generate/ci/ci.js";

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
      const sitesConfigPath =
        projectStructure.scopedSitesConfigPath?.getAbsolutePath() ??
        projectStructure.sitesConfigRoot.getAbsolutePath();
      createFeaturesJson(
        templateModules,
        path.join(`${sitesConfigPath}/features.json`)
      );
      finisher.succeed("Successfully wrote features.json");
    } catch (e: any) {
      finisher.fail("Failed to write features.json");
      console.error(colors.red(e.message));
      return;
    }

    finisher = logger.timedLog({ startLog: "Writing manifest.json" });
    try {
      generateManifestFile(templateModules, projectStructure);
      finisher.succeed("Successfully wrote manifest.json");
    } catch (e: any) {
      finisher.fail("Failed to write manifest.json");
      console.error(colors.red(e.message));
      return;
    }

    if (shouldGenerateFunctionMetadata()) {
      finisher = logger.timedLog({ startLog: "Writing functionMetadata.json" });
      try {
        await generateFunctionMetadataFile();
        finisher.succeed("Successfully wrote functionMetadata.json");
      } catch (e: any) {
        finisher.fail("Failed to write functionMetadata.json");
        console.error(colors.red(e.message));
        return;
      }
    }

    finisher = logger.timedLog({ startLog: "Updating ci.json" });
    try {
      updateCiConfig(
        path.join(
          projectStructure.sitesConfigRoot.getAbsolutePath(),
          projectStructure.ciConfig
        ),
        false
      );
      finisher.succeed("Successfully updated ci.json");
    } catch (e: any) {
      finisher.fail("Failed to update ci.json");
      console.error(colors.red(e.message));
      return;
    }
  };
};
