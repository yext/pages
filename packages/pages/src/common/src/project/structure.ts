import pathLib from "path";
import merge from "lodash/merge.js";
import { Path } from "./path.js";

/**
 * Defines the folder paths where certain files live, relative to the root of the project.
 *
 * @public
 */
export interface ProjectFilepaths {
  /** The folder path where all template files live */
  templatesRoot: string;
  /** The folder path where the sites-config files live */
  sitesConfigRoot: string;
  /** The folder path where the compiled files should go */
  distRoot: string;
  /** The folder path where the compiled hydration bundles should go */
  hydrationBundleOutputRoot: string;
  /** The folder path where the compiled server bundles should go */
  serverBundleOutputRoot: string;
  /**
   * This is used for the case of multibrand setup within a single repo.
   *
   * The subfolder path inside {@link templatesRoot} and {@link sitesConfigRoot}
   * to scope a build to a subset of templates using specific sites-config folder.
   */
  scope?: string;
}

/**
 * Defines the names of certain files, including extension.
 *
 * @public
 */
export interface ProjectFilenames {
  /** The name of the ci.json file */
  ciConfig: string;
  /** The name of the features.json file */
  featuresConfig: string;
  /** The name of the sites-stream.json file */
  siteStreamConfig: string;
}

/**
 * Defines how environment variables will be declared and processed.
 *
 * @public
 */
export interface EnvVar {
  /**
   * The directory, relative to the root of the user's site that
   * will house all the .env files which define env vars.
   */
  envVarDir: string;
  /**
   * If this prefix is prepended to an env vars name, then it will
   * be considered public. This means that at build time it will be
   * inline replaced in the code with the value of the env var and
   * accessible in the user's browser.
   */
  envVarPrefix: string;
}

/**
 * The configuration structure of a project.
 *
 * @public
 */
export interface ProjectStructureConfig {
  filepathsConfig: ProjectFilepaths;
  filenamesConfig: ProjectFilenames;
  envVarConfig: EnvVar;
}

export const defaultProjectStructureConfig: ProjectStructureConfig = {
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
    siteStreamConfig: "site-stream.json",
  },
  envVarConfig: {
    envVarDir: "",
    envVarPrefix: "YEXT_PUBLIC",
  },
};

/**
 * Recursively makes all fields on a given type optional.
 *
 * @public
 */
export type Optional<T> = {
  [P in keyof T]?: Optional<T[P]>;
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
  scope?: string;
  scopedTemplatesPath?: Path;
  scopedSitesConfigPath?: Path;

  distRoot: Path;
  hydrationBundleOutputRoot: Path;
  serverBundleOutputRoot: Path;
  ciConfig: string;
  featuresConfig: string;
  envVarDir: string;
  envVarPrefix: string;
  siteStreamConfig: string;

  constructor(config?: Optional<ProjectStructureConfig>) {
    this.#config = merge(defaultProjectStructureConfig, config);
    this.sitesConfigRoot = new Path(
      this.#config.filepathsConfig.sitesConfigRoot
    );
    this.templatesRoot = new Path(this.#config.filepathsConfig.templatesRoot);

    const scope = this.#config.filepathsConfig.scope;
    if (scope) {
      this.scope = scope;
      this.scopedSitesConfigPath = new Path(
        pathLib.join(this.sitesConfigRoot.path, scope)
      );
      this.scopedTemplatesPath = new Path(
        pathLib.join(this.templatesRoot.path, scope)
      );
    }

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
    this.siteStreamConfig = this.#config.filenamesConfig.siteStreamConfig;
  }
}
