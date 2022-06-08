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
  #config: ProjectStructureConfig;

  sitesConfigRoot: Path;
  templatesRoot: Path;
  distRoot: Path;
  hydrationBundleOutputRoot: Path;
  serverBundleOutputRoot: Path;
  ciConfig: string;
  featuresConfig: string;

  constructor(config: ProjectStructureConfig) {
    this.#config = _.merge(defaultConfig, config);
    this.sitesConfigRoot = new Path(
      this.#config.filepathsConfig.sitesConfigRoot
    );
    this.templatesRoot = new Path(this.#config.filepathsConfig.templatesRoot);
    this.distRoot = new Path(this.#config.filepathsConfig.distRoot);
    this.hydrationBundleOutputRoot = new Path(
      this.#config.filepathsConfig.distRoot +
        "/" +
        this.#config.filepathsConfig.hydrationBundleOutputRoot
    );
    this.serverBundleOutputRoot = new Path(
      this.#config.filepathsConfig.distRoot +
        "/" +
        this.#config.filepathsConfig.serverBundleOutputRoot
    );
    this.ciConfig = this.#config.filenamesConfig.ciConfig;
    this.featuresConfig = this.#config.filenamesConfig.featuresConfig;
  }
}

/**
 * Provides useful methods to operate on a specific property of {@link ProjectFilepathsConfig}.
 *
 * @public
 */
export class Path {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  getRelativePath = (to: string): string => {
    return `./${path.relative(this.path, to)}`;
  };

  getAbsolutePath = (): string => {
    return path.resolve(this.path);
  };
}
