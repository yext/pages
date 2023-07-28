import path from "path";
import { Path } from "../../common/src/project/path.js";
import { defaultProjectStructureConfig } from "../../common/src/project/structure.js";
import { CiConfig, Plugin } from "../../common/src/ci/ci.js";
import fs from "node:fs";
import colors from "picocolors";
import { loadFunctions } from "../../common/src/function/internal/loader.js";
import { Command } from "commander";

export const ciCommand = (program: Command) => {
  program
    .command("ci")
    .description("Generates ci.json file")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .option(
      "--yaml",
      "Write to templates.config + artifacts.config > features.json",
      true
    )
    .action((options, command) => {
      const scope = options.scope;
      const ciConfigFilename =
        defaultProjectStructureConfig.filenamesConfig.ciConfig;
      const sitesConfigRoot =
        defaultProjectStructureConfig.filepathsConfig.sitesConfigRoot;
      const ciConfigAbsolutePath = scope
        ? new Path(
            path.join(process.cwd(), sitesConfigRoot, scope, ciConfigFilename)
          )
        : new Path(path.join(process.cwd(), sitesConfigRoot, ciConfigFilename));
      updateCiConfig(ciConfigAbsolutePath.getAbsolutePath(), true);
    });
};

/**
 * Updates the ci.json by adding or updating the Generator plugin. Retunrs an error if the
 * file does not exist.
 *
 * @param ciConfigPath path to the ci.json file
 * @param calledViaCommand whether this function was called directly via the 'pages' command or
 * by another internal function. It guards whether the function throws or console.errors to give
 * a better UX.
 */
export const updateCiConfig = async (
  ciConfigPath: string,
  calledViaCommand: boolean
) => {
  const ciDir = path.dirname(ciConfigPath);
  if (!fs.existsSync(ciDir)) {
    fs.mkdirSync(ciDir);
  }

  let originalCiConfigJson = {} as CiConfig;
  if (fs.existsSync(ciConfigPath)) {
    originalCiConfigJson = JSON.parse(fs.readFileSync(ciConfigPath).toString());
  } else {
    if (calledViaCommand) {
      console.error(colors.red("sites-config/ci.json is missing"));
      return;
    } else {
      throw new Error("sites-config/ci.json is missing");
    }
  }

  const updatedCiConfigJson = await getUpdatedCiConfig(originalCiConfigJson);
  if (updatedCiConfigJson) {
    fs.writeFileSync(
      ciConfigPath,
      JSON.stringify(updatedCiConfigJson, null, "  ")
    );
  }
};

/**
 * Does the work of actually adding or replacing the Generator plugin.
 */
export const getUpdatedCiConfig = async (
  ciConfig: CiConfig
): Promise<CiConfig> => {
  const ciConfigCopy = structuredClone(ciConfig);
  ciConfigCopy.artifactStructure.plugins = [];

  const generatorPluginIndex = ciConfigCopy.artifactStructure.plugins.findIndex(
    (plugin) => {
      return plugin.event === "ON_PAGE_GENERATE";
    }
  );

  // replace the "Generator" plugin if it was already defined
  if (generatorPluginIndex !== -1) {
    ciConfigCopy.artifactStructure.plugins[generatorPluginIndex] =
      generatorPlugin;
    // otherwise add it
  } else {
    ciConfigCopy.artifactStructure.plugins.push(generatorPlugin);
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

    if (ciConfigCopy.artifactStructure.plugins) {
      const functionPluginIndex =
        ciConfigCopy.artifactStructure.plugins.findIndex((plugin) => {
          return plugin.pluginName === functionModule.config.name;
        });

      if (functionPluginIndex !== -1) {
        ciConfigCopy.artifactStructure.plugins[functionPluginIndex] = newEntry;
      } else {
        ciConfigCopy.artifactStructure.plugins?.push(newEntry);
      }
    }
  });

  return ciConfigCopy;
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
