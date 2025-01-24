import pathLib from "node:path";
import merge from "lodash/merge.js";
import fs from "node:fs";
import { Path } from "./path.js";
import { determineAssetsFilepath } from "../assets/getAssetsFilepath.js";
import { determinePublicFilepath } from "../assets/getPublicFilepath.js";

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
  /** The modules folder */
  modules: string;
  /** The redirects folder */
  redirects: string;
  /** The Node functions folder */
  serverlessFunctions: string; // Node functions
  /** Where to output the bundled static assets */
  assets: string;
  /** Where to output the bundled public assets */
  public: string;
  /** Where to output the client bundles */
  clientBundle: string;
  /** Where to output the server bundles */
  serverBundle: string;
  /** Where to output the redirect bundles */
  redirectBundle: string;
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
  /** the name of the sitemap.json file */
  sitemap: string;
  /** the name of the redirects.csv file */
  redirects: string;
  /** the name of the auth.json file */
  auth: string;
}

export interface DistConfigFiles {
  /** The name of the templates.json file */
  templates: string;
  /** The name of the artifacts.json file */
  artifacts: string;
  /** The name of the functionMetadata.json file */
  functionMetadata: string;
}

/**
 * Important files at the project's root.
 */
export interface RootFiles {
  /** The config.yaml file */
  config: string;
  /** The .template-manifest.json file for in-platform page sets */
  templateManifest: string;
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
  /** Specific Yext configuration files that are read from the dist folder */
  distConfigFiles: DistConfigFiles;
  /** Important files at the project's root */
  rootFiles: RootFiles;
  /** Defines how environment variables will be declared and processed */
  envVarConfig: EnvVar;

  /**
   * This is used for the case of multibrand setup within a single repo.
   *
   * The subfolder path inside src/templates and sites-config
   * to scope a build to a subset of templates using a specific sites-config folder.
   *
   * Modules scoping is also supported.
   */
  scope?: string;
}

const DEFAULT_ASSETS_DIR = "assets";

const DEFAULT_PUBLIC_DIR = "public";

const defaultProjectStructureConfig: ProjectStructureConfig = {
  rootFolders: {
    source: "src",
    dist: "dist",
    sitesConfig: "sites-config",
    functions: "functions",
  },
  subfolders: {
    templates: "templates",
    modules: "modules",
    redirects: "redirects",
    serverlessFunctions: "functions",
    assets: DEFAULT_ASSETS_DIR,
    public: DEFAULT_PUBLIC_DIR,
    clientBundle: "client",
    serverBundle: "server",
    redirectBundle: "redirect",
    renderBundle: "render",
    renderer: "renderer",
    static: "static",
    plugin: "plugin",
  },
  sitesConfigFiles: {
    ci: "ci.json",
    features: "features.json",
    siteStream: "site-stream.json",
    serving: "serving.json",
    sitemap: "sitemap.json",
    redirects: "redirects.csv",
    auth: "auth.json",
  },
  distConfigFiles: {
    templates: "templates.json",
    artifacts: "artifacts.json",
    functionMetadata: "functionMetadata.json",
  },
  rootFiles: {
    config: "config.yaml",
    templateManifest: ".template-manifest.json",
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
  config: ProjectStructureConfig;

  constructor(config?: Optional<ProjectStructureConfig>) {
    const mergedConfig = merge(defaultProjectStructureConfig, config);
    this.config = mergedConfig;
  }

  static init = async (
    projectStructureConfig?: Optional<ProjectStructureConfig>
  ) => {
    const config = merge(defaultProjectStructureConfig, projectStructureConfig);

    let viteConfigPath = pathLib.resolve(config.scope ?? "", "vite.config.js");
    if (config.scope && !fs.existsSync(viteConfigPath)) {
      viteConfigPath = pathLib.resolve("vite.config.js");
    }

    // TODO: handle other extensions
    const assetsDir = await determineAssetsFilepath(
      DEFAULT_ASSETS_DIR,
      viteConfigPath
    );

    config.subfolders.assets = assetsDir;

    const publicDir = await determinePublicFilepath(
      DEFAULT_PUBLIC_DIR,
      viteConfigPath
    );

    config.subfolders.public = publicDir;

    return new ProjectStructure(config);
  };

  /**
   * @returns the list of of src/templates, taking scope into account. If a scope is defined and
   * the scoped path exists, then both the scoped and non-scoped template paths are returned.
   */
  getTemplatePaths = () => {
    // src/templates
    const templatesRoot = pathLib.join(
      this.config.rootFolders.source,
      this.config.subfolders.templates
    );

    const scopedPath = pathLib.join(templatesRoot, this.config.scope ?? "");

    if (this.config.scope && fs.existsSync(scopedPath)) {
      return [new Path(scopedPath), new Path(templatesRoot)];
    }

    if (fs.existsSync(templatesRoot)) {
      return [new Path(templatesRoot)];
    }

    return [];
  };

  /**
   * @returns the list of src/redirects, taking scope into account. If a scope is defined and
   * the scoped path exists, then both the scoped and non-scoped redirect paths are returned.
   */
  getRedirectPaths = () => {
    // src/redirects
    const redirectsRoot = pathLib.join(
      this.config.rootFolders.source,
      this.config.subfolders.redirects
    );
    if (!fs?.existsSync(redirectsRoot)) {
      return [];
    }

    if (this.config.scope) {
      // src/redirects/[scope]
      const scopedPath: string = pathLib.join(redirectsRoot, this.config.scope);
      if (fs?.existsSync(scopedPath)) {
        return [new Path(scopedPath), new Path(redirectsRoot)];
      }
    }

    return [new Path(redirectsRoot)];
  };

  /**
   * @returns the {@link Path} to the sites-config folder, taking scope into account.
   */
  getSitesConfigPath = () => {
    return new Path(
      pathLib.join(this.config.rootFolders.sitesConfig, this.config.scope ?? "")
    );
  };

  /**
   * @returns the {@link Path} to the dist folder, taking scope into account.
   */
  getScopedDistPath = () => {
    return new Path(
      pathLib.join(this.config.rootFolders.dist, this.config.scope ?? "")
    );
  };

  /**
   * @returns the {@link Path} to the config.yaml file, taking scope into account.
   */
  getConfigYamlPath = () => {
    return new Path(
      pathLib.join(this.config.scope ?? "", this.config.rootFiles.config)
    );
  };

  /**
   * @returns the {@link Path} to the .template-manifest.json file, taking scope into account.
   */
  getTemplateManifestPath = () => {
    return new Path(
      pathLib.join(
        this.config.scope ?? "",
        this.config.rootFiles.templateManifest
      )
    );
  };

  /**
   * @returns the {@link Path} to the modules folder, taking scope into account.
   * If moduleName is provided, returns the path to that modules folder. If a scope is
   * defined and scoped path exists, then both the scoped and non-scoped module paths are returned.
   */
  getModulePaths = (moduleName?: string) => {
    const modulesPath = pathLib.join(
      this.config.rootFolders.source,
      this.config.subfolders.modules,
      moduleName ?? ""
    );
    const scopedPath = pathLib.join(
      this.config.rootFolders.source,
      this.config.subfolders.modules,
      this.config.scope ?? "",
      moduleName ?? ""
    );

    if (this.config.scope && fs.existsSync(scopedPath)) {
      return [new Path(scopedPath), new Path(modulesPath)];
    }

    return [new Path(modulesPath)];
  };
}
