import manifest from "./manifest.json" assert { type: "json" };

export type Manifest = {
  /** A map of feature name to the server path of the feature */
  serverPaths: {
    [key: string]: string;
  };
  /** A map of feature name to the client path of the feature */
  clientPaths: {
    [key: string]: string;
  };
  /** A map of render template to its bundle path */
  renderPaths: {
    [key: string]: string;
  };
  /** The configuration structure of a project */
  projectStructure: ProjectStructureConfig;
  /** If the bundler used generates a manifest.json then this field will contain that json object */
  bundlerManifest?: any;
};

export const loadManifest = (): Manifest => {
  return manifest;
};

/************  Keep everything below in sync with packages/pages/src/common/src/project/structure.ts ********/

/**
 * All important folders defined at the root of the project.
 */
export interface RootFolders {
  /** The source code folder */
  source: string;
  /** Where to output the bundled code */
  dist: string;
  /** The Yext platform configuration files folder */
  sitesConfig: string;
  /** The Deno functions folder prior to the swap to Node functions */
  functions: string; // Deno functions
}

/**
 * All important folders within a specific root folder.
 */
export interface Subfolders {
  /** The templates folder */
  templates: string;
  /** The Node functions folder */
  serverlessFunctions: string; // Node functions
  /** Where to output the bundled static assets */
  assets: string;
  /** Where to output the client bundles */
  clientBundle: string;
  /** Where to output the server bundles */
  serverBundle: string;
  /** Where to output the render bundles */
  renderBundle: string; // _client and _server
  /** Where to output the renderer bundle */
  renderer: string;
  /** Where to output the static bundles */
  static: string;
  /** The location of the Deno plugin entrypoint (mod.ts, manifest.ts, manifest.json) */
  plugin: string;
}

/**
 * Files specific to the Yext configuration folder.
 */
export interface SitesConfigFiles {
  /** The name of the ci.json file */
  ci: string;
  /** The name of the features.json file */
  features: string;
  /** The name of the sites-stream.json file */
  siteStream: string;
  /** the name of the serving.json file */
  serving: string;
}

/**
 * Important files at the project's root.
 */
export interface RootFiles {
  /** The config.yaml file */
  config: string;
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
   * If this prefix is prepended to an env vars' name, then it will
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
  /** All important folders defined at the root of the project */
  rootFolders: RootFolders;
  /** All important folders within a specific root folder */
  subfolders: Subfolders;
  /** Files specific to the Yext configuration folder */
  sitesConfigFiles: SitesConfigFiles;
  /** Important files at the project's root */
  rootFiles: RootFiles;
  /** Defines how environment variables will be declared and processed */
  envVarConfig: EnvVar;
  /**
   * This is used for the case of multibrand setup within a single repo.
   *
   * The subfolder path inside src/templates and sites-config
   * to scope a build to a subset of templates using a specific sites-config folder.
   */
  scope?: string;
}
