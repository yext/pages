import path from "path";
import { ProjectStructure } from "../../common/src/project/structure.js";
import fs from "node:fs";
import { loadFunctions } from "../../common/src/function/internal/loader.js";
import {
  ArtifactsConfig,
  Plugin,
} from "../../common/src/artifacts/internal/types.js";

/**
 * Creates the artifacts.json file with the Generator plugin.
 *
 * @param artifactPath path to the artifacts.json file
 * @param calledViaCommand whether this function was called directly via the 'pages' command or
 * by another internal function. It guards whether the function throws or console.errors to give
 * a better UX.
 */
export const createArtifactsJson = async (
  artifactPath: string,
  projectStructure: ProjectStructure
) => {
  const artifactsDir = path.dirname(artifactPath);
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const artifactsConfig = await getArtifactsConfig(projectStructure);

  fs.writeFileSync(artifactPath, JSON.stringify(artifactsConfig, null, "  "));
};

/**
 * Does the work of actually adding or replacing the Generator plugin.
 */
export const getArtifactsConfig = async (
  projectStructure: ProjectStructure
): Promise<ArtifactsConfig> => {
  const artifactConfig: ArtifactsConfig = {
    artifactStructure: {
      assets: [
        // assets from the plugin
        {
          root: projectStructure.config.rootFolders.dist,
          pattern: `${projectStructure.config.subfolders.assets}/**/*`,
        },
        // static assets based on the Vite publicDir
        {
          root: `${projectStructure.config.rootFolders.dist}/public_assets`,
          pattern: "**/*",
        },
        {
          root: projectStructure.config.rootFolders.dist,
          pattern: `${projectStructure.config.subfolders.widgets}/**/*`,
        },
      ],
      plugins: [getGeneratorPlugin(projectStructure)],
    },
  };

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

    if (artifactConfig.artifactStructure.plugins) {
      const functionPluginIndex =
        artifactConfig.artifactStructure.plugins.findIndex((plugin) => {
          return plugin.pluginName === functionModule.config.name;
        });

      if (functionPluginIndex !== -1) {
        artifactConfig.artifactStructure.plugins[functionPluginIndex] =
          newEntry;
      } else {
        artifactConfig.artifactStructure.plugins?.push(newEntry);
      }
    }
  });

  return artifactConfig;
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
    widgets,
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
      {
        root: `${rootFolders.dist}/${widgets}`,
        pattern: "*{.js}",
      },
    ],
    event: "ON_PAGE_GENERATE",
    functionName: "PagesGenerator",
  };
};
