import path from "path";
import _ from "lodash";

/**
 * Defines the folder paths where certain files live, relative to the root of the project.
 *
 * @public
 */
export interface ProjectPathsConfig {
  /** The folder path where the template files live */
  templatesRoot?: string;
  /** The folder path where the sites-config files live */
  sitesConfigRoot?: string;
  /** The folder path where the compiled files should go */
  distRoot?: string;
  /** The folder path where the compiled hydration bundles should go */
  hydrationBundleOutputRoot?: string;
  /** The folder path where the compiled server bundles should go */
  serverBundleOutputRoot?: string;
}

/**
 * Defines the names of certain files, including extension.
 *
 * @public
 */
export interface ProjectFilesConfig {
  /** The name of the ci.json file */
  ciConfig?: string;
  /** The name of the features.json file */
  featuresConfig?: string;
}

/**
 * The configuration of where files live and their names for this project.
 *
 * @public
 */
export interface ProjectStructureConfig {
  pathsConfig: ProjectPathsConfig;
  filesConfig: ProjectFilesConfig;
}

const defaultConfig: ProjectStructureConfig = {
  pathsConfig: {
    templatesRoot: "src/templates",
    sitesConfigRoot: "sites-config",
    distRoot: "dist",
    hydrationBundleOutputRoot: "hydration_templates",
    serverBundleOutputRoot: "assets/server",
  },
  filesConfig: {
    ciConfig: "ci.json",
    featuresConfig: "features.json",
  },
};

/**
 * Provides useful methods to operate on a configured project structure.
 *
 * @public
 */
export class ProjectStructure {
  config: ProjectStructureConfig;

  constructor(config: ProjectStructureConfig) {
      this.config = this.updatePaths(_.merge(defaultConfig, config));
      console.log(this.config);
  }

  /**
   * Updates certain paths with their roots if not already specified. This makes it so you can do
   * things like only change the distRoot without having to also update the hydrationBundleOutputRoot
   * manually.
   */
  updatePaths = (config: ProjectStructureConfig): ProjectStructureConfig => {
      const distRoot = config.pathsConfig.distRoot;
      config.pathsConfig.hydrationBundleOutputRoot = distRoot + "/" + config.pathsConfig.hydrationBundleOutputRoot;
      config.pathsConfig.serverBundleOutputRoot = distRoot + "/" + config.pathsConfig.serverBundleOutputRoot;

      return config;
  }

  getRelativePath = <T extends keyof ProjectPathsConfig>(
    pathType: T,
    to: string
  ): string => {
    return `./${path.relative(this.config.pathsConfig[pathType], to)}`;
  };

  getAbsolutePath = <T extends keyof ProjectPathsConfig>(
    pathType: T
  ): string => {
    return path.resolve(this.config.pathsConfig[pathType]);
  };
}
