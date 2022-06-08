import path from "path";
import _ from "lodash";

/**
 * Defines the folder paths where certain files live, relative to the root of the project.
 *
 * @public
 */
export interface ProjectFilepathsConfig {
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
export interface ProjectFilenamesConfig {
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
  filepathsConfig?: ProjectFilepathsConfig;
  filenamesConfig?: ProjectFilenamesConfig;
}

const defaultConfig: ProjectStructureConfig = {
  filepathsConfig: {
    templatesRoot: "src/templates",
    sitesConfigRoot: "sites-config",
    distRoot: "dist",
    hydrationBundleOutputRoot: "hydration_templates",
    serverBundleOutputRoot: "assets/server",
  },
  filenamesConfig: {
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
    const distRoot = config.filepathsConfig.distRoot;
    config.filepathsConfig.hydrationBundleOutputRoot =
      distRoot + "/" + config.filepathsConfig.hydrationBundleOutputRoot;
    config.filepathsConfig.serverBundleOutputRoot =
      distRoot + "/" + config.filepathsConfig.serverBundleOutputRoot;

    return config;
  };

  getRelativePath = <T extends keyof ProjectFilepathsConfig>(
    pathType: T,
    to: string
  ): string => {
    return `./${path.relative(this.config.filepathsConfig[pathType], to)}`;
  };

  getAbsolutePath = <T extends keyof ProjectFilepathsConfig>(
    pathType: T
  ): string => {
    return path.resolve(this.config.filepathsConfig[pathType]);
  };
}
