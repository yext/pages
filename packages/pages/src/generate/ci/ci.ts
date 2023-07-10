import path from "path";
import { CommandModule } from "yargs";
import { Path } from "../../common/src/project/path.js";
import {
  defaultProjectStructureConfig,
  ProjectFilepaths,
} from "../../common/src/project/structure.js";
import { CiConfig, Plugin } from "../../common/src/ci/ci.js";
import fs from "node:fs";
import colors from "picocolors";

type FeaturesArgs = Pick<ProjectFilepaths, "scope">;

const handler = ({ scope }: FeaturesArgs): void => {
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
};

/**
 * The "ci" command that updates a ci.json file.
 */
export const ciCommandModule: CommandModule<unknown, FeaturesArgs> = {
  command: "ci",
  describe: "Generates ci.json file",
  builder: (yargs) => {
    return yargs.option("scope", {
      describe: "The subfolder to scope the served templates from",
      type: "string",
      demandOption: false,
    });
  },
  handler,
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
export const updateCiConfig = (
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

  const updatedCiConfigJson = getUpdatedCiConfig(originalCiConfigJson);
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
export const getUpdatedCiConfig = (ciConfig: CiConfig): CiConfig => {
  const ciConfigCopy = structuredClone(ciConfig);
  if (!ciConfigCopy.artifactStructure.plugins) {
    ciConfigCopy.artifactStructure.plugins = [];
  }

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
