import path from "path";
import fs from "fs-extra";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { Command } from "commander";
import { defaultProjectStructureConfig } from "../../common/src/project/structure.js";
import {
  defaultArtifactConfig,
  ArtifactsConfig,
  Plugin,
} from "../../common/src/feature/artifacts.js";
import { loadFunctions } from "../../common/src/function/internal/loader.js";

export const artifactsCommand = (program: Command) => {
  program
    .command("artifacts")
    .description("Generates artifacts.config file")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .option("--yaml", "Write to artifacts.config")
    .action(async (options) => {
      if (options.yaml) {
        const scope = options.scope;
        const projectStructure = new ProjectStructure();
        const distRoot = projectStructure.distRoot.path;
        const artifactsFileName =
          defaultProjectStructureConfig.filenamesConfig.artifactsConfig ??
          "artifacts.config";
        const artifactsFilepath = path.join(
          process.cwd(),
          distRoot,
          scope ?? "",
          artifactsFileName
        );
        createArtifactsConfig(artifactsFilepath);
      }
    });
};

const generatorPlugin: Plugin = {
  pluginName: "PagesGenerator",
  sourceFiles: [
    {
      root: "dist/plugin",
      pattern: "*{.ts,.json}",
    },
    {
      root: "dist",
      pattern: "assets/{server,static,renderer,render}/**/*{.js,.css}",
    },
  ],
  event: "ON_PAGE_GENERATE",
  functionName: "PagesGenerator",
};

/**
 * Generates artifacts.config from the templates.
 */
export const createArtifactsConfig = async (artifactsPath: string) => {
  const artifactsDir = path.dirname(artifactsPath);
  let originalArtifactsConfig = defaultArtifactConfig;
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }
  if (fs.existsSync(artifactsPath)) {
    originalArtifactsConfig = JSON.parse(
      fs.readFileSync(artifactsPath).toString()
    );
  }
  const updatedArtifactsConfig = await getUpdatedArtifactsConfig(
    originalArtifactsConfig
  );
  if (updatedArtifactsConfig) {
    fs.writeFileSync(
      artifactsPath,
      JSON.stringify(updatedArtifactsConfig, null, "  ")
    );
  }
};

export const getUpdatedArtifactsConfig = async (
  artifactsConfig: ArtifactsConfig
): Promise<ArtifactsConfig> => {
  const artifactsConfigCopy = structuredClone(artifactsConfig);
  artifactsConfigCopy.artifactStructure.plugins = [];
  const generatorPluginIndex =
    artifactsConfigCopy.artifactStructure.plugins.findIndex((plugin) => {
      return plugin.event === "ON_PAGE_GENERATE";
    });

  // replace the "Generator" plugin if it was already defined
  if (generatorPluginIndex !== -1) {
    artifactsConfigCopy.artifactStructure.plugins[generatorPluginIndex] =
      generatorPlugin;
  } else {
    artifactsConfigCopy.artifactStructure.plugins.push(generatorPlugin);
  }

  // add any user-defined functions
  const functionModules = await loadFunctions(
    defaultProjectStructureConfig.filepathsConfig.functionsRoot
  );
  functionModules.forEach((functionModule) => {
    const newEntry: Plugin = {
      pluginName: functionModule.config.name,
      event: functionModule.config.event,
      functionName: functionModule.config.functionName,
      apiPath:
        functionModule.config.event === "API"
          ? functionModule.slug.production
          : undefined,
      sourceFiles: [
        {
          root: path.join(
            defaultProjectStructureConfig.filepathsConfig.distRoot,
            defaultProjectStructureConfig.filepathsConfig
              .functionBundleOutputRoot,
            functionModule.config.name
          ),
          pattern: "*{.js,.ts}",
        },
      ],
    };

    if (artifactsConfigCopy.artifactStructure.plugins) {
      const functionPluginIndex =
        artifactsConfigCopy.artifactStructure.plugins.findIndex((plugin) => {
          return plugin.pluginName === functionModule.config.name;
        });

      if (functionPluginIndex !== -1) {
        artifactsConfigCopy.artifactStructure.plugins[functionPluginIndex] =
          newEntry;
      } else {
        artifactsConfigCopy.artifactStructure.plugins?.push(newEntry);
      }
    }
  });
  return artifactsConfigCopy;
};
