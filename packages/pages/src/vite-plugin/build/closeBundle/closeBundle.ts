import glob from "glob";
import * as path from "path";
import { pathToFileURL } from "url";
import fs from "fs";
import logger from "../../log.js";
import { generateManifestFile } from "./manifest.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
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
import { getFunctionFilepaths } from "../../../common/src/function/internal/getFunctionFilepaths.js";

export default (projectStructure: ProjectStructure) => {
  return async () => {
    let finisher = logger.timedLog({ startLog: "Validating template modules" });
    let templateModules: TemplateModuleCollection;
    try {
      const serverBundles = glob.sync(
        path.join(
          projectStructure.serverBundleOutputRoot.getAbsolutePath(),
          "**/*.js"
        ),
        {
          ignore: path.join(
            projectStructure.functionBundleOutputRoot.getAbsolutePath(),
            "**"
          ),
        }
      );
      templateModules = await loadTemplateModules(serverBundles, false, true);
      validateUniqueFeatureName(templateModules);
      validateBundles();
      finisher.succeed("Validated template modules");
    } catch (e: any) {
      finisher.fail("One or more template modules failed validation");
      throw new Error(e);
    }

    /*
     * Functions are bundled as mod.ts. This code runs as closeBuild.js. JS files cannot
     * import TS, so we cannot simply import the function file. We also cannot do
     * loadFunctionModules because that makes assumptions about the directory structure of src,
     * not dist.
     *
     * This code makes a copy of mod.ts named mod.js so we can import it. It
     * checks for a default export and then deletes the .js file.
     * The outer try/catch is for validation errors. The inner try/catch is for copy/import errors.
     */
    finisher = logger.timedLog({ startLog: "Validating functions" });
    try {
      const functionFilepaths = getFunctionFilepaths("dist/functions");
      await Promise.all(
        functionFilepaths.map(async (filepath) => {
          const jsFilepath = path.format(filepath).replace(".ts", ".js");
          try {
            fs.copyFileSync(path.format(filepath), jsFilepath);
            const functionModule = await import(
              pathToFileURL(
                path.format(filepath).replace(".ts", ".js")
              ).toString()
            );
            if (!functionModule.default) {
              return Promise.reject(
                `${path.format(filepath)} is missing a default export.`
              );
            }
          } finally {
            fs.unlinkSync(jsFilepath);
          }
        })
      );
      finisher.succeed("Validated functions");
    } catch (e) {
      finisher.fail("One or more functions failed validation");
      throw e;
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
      throw new Error(e);
    }

    finisher = logger.timedLog({ startLog: "Writing manifest.json" });
    try {
      generateManifestFile(templateModules, projectStructure);
      finisher.succeed("Successfully wrote manifest.json");
    } catch (e: any) {
      finisher.fail("Failed to write manifest.json");
      throw new Error(e);
    }

    if (shouldGenerateFunctionMetadata()) {
      finisher = logger.timedLog({ startLog: "Writing functionMetadata.json" });
      try {
        await generateFunctionMetadataFile();
        finisher.succeed("Successfully wrote functionMetadata.json");
      } catch (e: any) {
        finisher.fail("Failed to write functionMetadata.json");
        throw new Error(e);
      }
    }

    finisher = logger.timedLog({ startLog: "Updating ci.json" });
    try {
      await updateCiConfig(
        path.join(
          projectStructure.sitesConfigRoot.getAbsolutePath(),
          projectStructure.ciConfig
        ),
        false
      );
      finisher.succeed("Successfully updated ci.json");
    } catch (e: any) {
      finisher.fail("Failed to update ci.json");
      throw new Error(e);
    }
  };
};

/**
 * Checks that a feature name doesn't appear twice in the set of template modules.
 * @param templateModuleCollection
 */
const validateUniqueFeatureName = (
  templateModuleCollection: TemplateModuleCollection
) => {
  const featureNames = new Set<string>();
  [...templateModuleCollection.keys()].forEach((featureName) => {
    if (featureNames.has(featureName)) {
      throw new Error(
        `Templates must have unique feature names. Found multiple modules with "${featureName}"`
      );
    }
    featureNames.add(featureName);
  });
};
