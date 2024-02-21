import path from "path";
import { Path } from "../../common/src/project/path.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { CiConfig, Plugin } from "../../common/src/ci/ci.js";
import fs from "node:fs";
import colors from "picocolors";
import { loadFunctions } from "../../common/src/function/internal/loader.js";
import { Command } from "commander";

const handler = async ({ scope }: { scope: string }) => {
  const projectStructure = await ProjectStructure.init({ scope });

  const ciPath = new Path(
    path.join(
      projectStructure.getSitesConfigPath().path,
      projectStructure.config.sitesConfigFiles.ci
    )
  );

  updateCiConfig(ciPath.getAbsolutePath(), true, projectStructure);
};

export const ciCommand = (program: Command) => {
  program
    .command("ci")
    .description("Generates ci.json file")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(handler);
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
  calledViaCommand: boolean,
  projectStructure: ProjectStructure
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
      console.error(colors.red(`${ciConfigPath} is missing`));
      return;
    } else {
      throw new Error(`${ciConfigPath} is missing`);
    }
  }

  const updatedCiConfigJson = await getUpdatedCiConfig(
    originalCiConfigJson,
    projectStructure
  );
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
  ciConfig: CiConfig,
  projectStructure: ProjectStructure
): Promise<CiConfig> => {
  const ciConfigCopy = structuredClone(ciConfig);

  ciConfigCopy.artifactStructure.assets = [];

  // assets from the plugin
  ciConfigCopy.artifactStructure.assets.push({
    root: projectStructure.config.rootFolders.dist,
    pattern: `${projectStructure.config.subfolders.assets}/**/*`,
  });

  ciConfigCopy.artifactStructure.assets.push({
    root: projectStructure.config.rootFolders.dist,
    pattern: `${projectStructure.config.subfolders.modules}/**/*`,
  });

  // static assets based on the Vite publicDir
  ciConfigCopy.artifactStructure.assets.push({
    root: `${projectStructure.config.rootFolders.dist}/public_assets`,
    pattern: "**/*",
  });

  ciConfigCopy.artifactStructure.plugins = [];

  const generatorPluginIndex = ciConfigCopy.artifactStructure.plugins.findIndex(
    (plugin) => {
      return plugin.event === "ON_PAGE_GENERATE";
    }
  );

  const generatorPlugin = getGeneratorPlugin(projectStructure);

  // replace the "Generator" plugin if it was already defined
  if (generatorPluginIndex !== -1) {
    ciConfigCopy.artifactStructure.plugins[generatorPluginIndex] =
      generatorPlugin;
    // otherwise add it
  } else {
    ciConfigCopy.artifactStructure.plugins.push(generatorPlugin);
  }

  const { rootFolders, subfolders } = projectStructure.config;

  // add any user-defined functions
  const functionModules = await loadFunctions(
    path.join(rootFolders.source, subfolders.serverlessFunctions),
    projectStructure
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
            rootFolders.dist,
            subfolders.serverlessFunctions,
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

const getGeneratorPlugin = (projectStructure: ProjectStructure): Plugin => {
  const { rootFolders, subfolders } = projectStructure.config;
  const {
    assets,
    renderer,
    clientBundle,
    serverBundle,
    static: _static,
    renderBundle,
    plugin,
  } = subfolders;

  return {
    pluginName: "PagesGenerator",
    sourceFiles: [
      {
        root: `${rootFolders.dist}/${plugin}`,
        pattern: "*{.ts,.json}",
      },
      {
        root: `${rootFolders.dist}`,
        pattern: `${assets}/{${serverBundle},${_static},${renderer},${renderBundle},${clientBundle}}/**/*{.js,.css}`,
      },
    ],
    event: "ON_PAGE_GENERATE",
    functionName: "PagesGenerator",
  };
};
