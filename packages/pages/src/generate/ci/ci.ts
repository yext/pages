import path from "path";
import { CommandModule } from "yargs";
import { Path } from "../../common/src/project/path.js";
import { defaultProjectStructureConfig } from "../../common/src/project/structure.js";
import { CiConfig, Plugin } from "../../common/src/ci/ci.js";
import fs from "node:fs";
import colors from "picocolors";

const handler = (): void => {
  const ciConfigFilename =
    defaultProjectStructureConfig.filenamesConfig.ciConfig;
  const sitesConfigRoot =
    defaultProjectStructureConfig.filepathsConfig.sitesConfigRoot;
  const ciConfigAbsolutePath = new Path(
    path.join(process.cwd(), sitesConfigRoot, ciConfigFilename)
  );
  updateCiConfig(ciConfigAbsolutePath.getAbsolutePath(), true);
};

export const ciCommandModule: CommandModule<unknown, unknown> = {
  command: "ci",
  describe: "Generates ci.json file",
  builder: (yargs) => yargs,
  handler,
};

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

  const ciJson = mergeCiConfig(originalCiConfigJson);
  if (ciJson) {
    fs.writeFileSync(ciConfigPath, JSON.stringify(ciJson, null, "  "));
  }
};

export const mergeCiConfig = (ciConfig: CiConfig): CiConfig | undefined => {
  if (!ciConfig.artifactStructure.plugins) {
    ciConfig.artifactStructure.plugins = [];
  }

  let hasGeneratorPlugin = false;

  // replace the "Generator" plugin if it was already defined
  ciConfig.artifactStructure.plugins = ciConfig.artifactStructure.plugins.map(
    (plugin) => {
      if (plugin.pluginName === generatorPluginName) {
        hasGeneratorPlugin = true;
        return generatorPlugin;
      }
      return plugin;
    }
  );

  if (!hasGeneratorPlugin) {
    ciConfig.artifactStructure.plugins.push(generatorPlugin);
  }

  return ciConfig;
};

const generatorPluginName = "Generator";
const generatorPlugin: Plugin = {
  pluginName: generatorPluginName,
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
  functionName: "Generate",
};
