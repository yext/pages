import { glob } from "glob";
import * as path from "path";
import { pathToFileURL } from "url";
import fs from "fs";
import logger from "../../log.js";
import { generateManifestFile } from "./manifest.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { validateBundles } from "./bundleValidator.js";
import {
  generateFunctionMetadataFile,
  shouldGenerateFunctionMetadata,
} from "./functionMetadata.js";
import { updateCiConfig } from "../../../generate/ci/ci.js";
import { getFunctionFilepaths } from "../../../common/src/function/internal/getFunctionFilepaths.js";
import {
  bundleServerlessFunctions,
  shouldBundleServerlessFunctions,
} from "./serverlessFunctions.js";
import { createFeaturesJson } from "../../../generate/templates/createTemplatesJsonFromModule.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import {
  TemplateModuleCollection,
  loadTemplateModules,
} from "../../../common/src/template/loader/loader.js";
import { logErrorAndExit } from "../../../util/logError.js";

export default (projectStructure: ProjectStructure) => {
  return async () => {
    let finisher = logger.timedLog({ startLog: "Validating template modules" });
    let templateModules: TemplateModuleCollection;

    const { rootFolders, subfolders } = projectStructure.config;

    try {
      const serverBundles = glob.sync(
        convertToPosixPath(
          path.join(
            path.resolve(
              rootFolders.dist,
              subfolders.assets,
              subfolders.serverBundle
            ),
            "**/*.js"
          )
        ),
        {
          ignore: path.join(
            path.resolve(rootFolders.dist, subfolders.serverlessFunctions),
            "**"
          ),
        }
      );
      templateModules = await loadTemplateModules(
        serverBundles,
        false,
        true,
        projectStructure
      );

      validateUniqueFeatureName(templateModules);
      validateBundles(projectStructure);
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
    if (shouldGenerateFunctionMetadata(projectStructure)) {
      finisher = logger.timedLog({ startLog: "Validating functions" });
      try {
        const functionFilepaths = getFunctionFilepaths(
          path.join("dist", "functions")
        );
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
        logErrorAndExit(e);
      }

      finisher = logger.timedLog({ startLog: "Writing functionMetadata.json" });
      try {
        await generateFunctionMetadataFile(projectStructure);
        finisher.succeed("Successfully wrote functionMetadata.json");
      } catch (e: any) {
        finisher.fail("Failed to write functionMetadata.json");
        logErrorAndExit(e);
      }
    }

    if (shouldBundleServerlessFunctions(projectStructure)) {
      finisher = logger.timedLog({ startLog: "Bundling serverless functions" });
      try {
        await bundleServerlessFunctions(projectStructure);
        finisher.succeed("Successfully bundled serverless functions");
      } catch (e: any) {
        finisher.fail("Failed to bundle serverless functions");
        logErrorAndExit(e);
      }
    }

    finisher = logger.timedLog({ startLog: "Writing features.json" });
    try {
      createFeaturesJson(templateModules, projectStructure);
      finisher.succeed("Successfully wrote features.json");
    } catch (e: any) {
      finisher.fail("Failed to write features.json");
      logErrorAndExit(e);
    }

    finisher = logger.timedLog({ startLog: "Writing manifest.json" });
    try {
      generateManifestFile(templateModules, projectStructure);
      finisher.succeed("Successfully wrote manifest.json");
    } catch (e: any) {
      finisher.fail("Failed to write manifest.json");
      logErrorAndExit(e);
    }

    finisher = logger.timedLog({ startLog: "Updating ci.json" });
    try {
      const sitesConfigAbsolutePath = projectStructure
        .getSitesConfigPath()
        .getAbsolutePath();
      await updateCiConfig(
        path.join(
          sitesConfigAbsolutePath,
          projectStructure.config.sitesConfigFiles.ci
        ),
        false,
        projectStructure
      );
      finisher.succeed("Successfully updated ci.json");
    } catch (e: any) {
      finisher.fail("Failed to update ci.json");
      logErrorAndExit(e);
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
