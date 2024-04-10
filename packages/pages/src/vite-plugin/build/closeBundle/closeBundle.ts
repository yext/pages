import { glob } from "glob";
import * as path from "path";
import logger from "../../log.js";
import { generateManifestFile } from "./manifest.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { validateBundles } from "./bundleValidator.js";
import {
  generateFunctionMetadataFile,
  shouldGenerateFunctionMetadata,
} from "./functionMetadata.js";
import { updateCiConfig } from "../../../generate/ci/ci.js";
import { createTemplatesJsonFromModule } from "../../../generate/templates/createTemplatesJson.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import {
  TemplateModuleCollection,
  loadTemplateModules,
} from "../../../common/src/template/loader/loader.js";
import { logErrorAndClean } from "../../../util/logError.js";
import { isUsingConfig } from "../../../util/config.js";
import { createArtifactsJson } from "../../../generate/artifacts/createArtifactsJson.js";
import { Path } from "../../../common/src/project/path.js";
import {
  loadRedirectModules,
  RedirectModuleCollection,
} from "../../../common/src/redirect/loader/loader.js";
import { getRedirectFilePathsFromProjectStructure } from "../../../common/src/redirect/internal/getRedirectFilepaths.js";

export default (projectStructure: ProjectStructure) => {
  return {
    sequential: true,
    handler: async () => {
      let finisher = logger.timedLog({
        startLog: "Validating template modules",
      });
      let templateModules: TemplateModuleCollection;
      let redirectModules: RedirectModuleCollection;

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
            ignore: [
              path.join(
                path.resolve(rootFolders.dist, subfolders.serverlessFunctions),
                "**"
              ),
              path.join(
                path.resolve(rootFolders.dist, subfolders.modules),
                "**"
              ),
              path.join(
                path.resolve(rootFolders.dist, subfolders.redirects),
                "**"
              ),
            ],
          }
        );
        templateModules = await loadTemplateModules(
          serverBundles,
          false,
          true,
          projectStructure
        );

        const redirectPaths =
          getRedirectFilePathsFromProjectStructure(projectStructure);
        redirectModules = await loadRedirectModules(
          redirectPaths,
          true,
          false,
          projectStructure
        );

        validateUniqueFeatureName(templateModules);
        validateBundles(projectStructure);
        finisher.succeed("Validated template modules");
      } catch (e: any) {
        finisher.fail("One or more template modules failed validation");
        await logErrorAndClean(e, projectStructure);
        return;
      }

      if (shouldGenerateFunctionMetadata(projectStructure)) {
        finisher = logger.timedLog({
          startLog: "Writing functionMetadata.json",
        });
        try {
          // root functions are validated in this process
          await generateFunctionMetadataFile(projectStructure);
          finisher.succeed("Successfully wrote functionMetadata.json");
        } catch (e: any) {
          finisher.fail("Failed to write functionMetadata.json");
          await logErrorAndClean(e, projectStructure);
        }
      }

      const configYamlName = projectStructure.config.rootFiles.config;

      if (isUsingConfig(configYamlName, projectStructure.config.scope)) {
        finisher = logger.timedLog({ startLog: "Writing templates.json" });
        try {
          createTemplatesJsonFromModule(
            templateModules,
            redirectModules,
            projectStructure,
            "TEMPLATES"
          );
          finisher.succeed("Successfully wrote templates.json");
        } catch (e: any) {
          finisher.fail("Failed to write templates.json");
          await logErrorAndClean(e, projectStructure);
        }
      } else {
        finisher = logger.timedLog({ startLog: "Writing features.json" });
        try {
          createTemplatesJsonFromModule(
            templateModules,
            redirectModules,
            projectStructure,
            "FEATURES"
          );
          finisher.succeed("Successfully wrote features.json");
        } catch (e: any) {
          finisher.fail("Failed to write features.json");
          await logErrorAndClean(e, projectStructure);
        }
      }

      finisher = logger.timedLog({ startLog: "Writing manifest.json" });
      try {
        await generateManifestFile(templateModules, projectStructure);
        finisher.succeed("Successfully wrote manifest.json");
      } catch (e: any) {
        finisher.fail("Failed to write manifest.json");
        await logErrorAndClean(e, projectStructure);
      }

      if (isUsingConfig(configYamlName, projectStructure.config.scope)) {
        finisher = logger.timedLog({ startLog: "Writing artifacts.json" });
        try {
          const artifactPath = new Path(
            path.join(
              projectStructure.getScopedDistPath().path,
              projectStructure.config.distConfigFiles.artifacts
            )
          );

          // src/functions are validated in this process
          await createArtifactsJson(
            artifactPath.getAbsolutePath(),
            projectStructure
          );

          finisher.succeed("Successfully wrote artifacts.json");
        } catch (e: any) {
          finisher.fail("Failed to update artifacts.json");
          await logErrorAndClean(e, projectStructure);
        }
      } else {
        finisher = logger.timedLog({ startLog: "Updating ci.json" });
        try {
          const sitesConfigAbsolutePath = projectStructure
            .getSitesConfigPath()
            .getAbsolutePath();

          // src/functions are validated in this process
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
          await logErrorAndClean(e, projectStructure);
        }
      }
    },
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
      throw `Templates must have unique feature names. Found multiple modules with "${featureName}"`;
    }
    featureNames.add(featureName);
  });
};
