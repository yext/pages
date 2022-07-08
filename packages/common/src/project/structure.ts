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
 * Defines how environment variables will be declared and processed.
 *
 * @public
 */
export interface EnvVarConfig {
  /**
   * The directory, relative to the root of the user's site that
   * will house all the .env files which define env vars.
   */
  envVarDir?: string;
  /**
   * If this prefix is prepended to an env vars name, then it will
   * be considered public. This means that at build time it will be
   * inline replaced in the code with the value of the env var and
   * accessible in the user's browser.
   */
  envVarPrefix?: string;
}

/**
 * The configuration of where files live and their names for this project.
 *
 * @public
 */
export interface ProjectStructureConfig {
  filepathsConfig?: ProjectFilepathsConfig;
  filenamesConfig?: ProjectFilenamesConfig;
  envVarConfig?: EnvVarConfig;
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
  envVarConfig: {
    envVarDir: "",
    envVarPrefix: "YEXT_PUBLIC",
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
  envVarDir: string;
  envVarPrefix: string;

  constructor(config?: ProjectStructureConfig) {
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
    this.envVarDir = this.#config.envVarConfig.envVarDir;
    this.envVarPrefix = this.#config.envVarConfig.envVarPrefix;
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
