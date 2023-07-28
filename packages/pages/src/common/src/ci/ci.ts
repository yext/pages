/**
 * The shape of data that represents a ci.json file, used by Yext Pages.
 */
export interface CiConfig {
  artifactStructure: ArtifactStructure;
  /**
   * An optional optimization for the build step. It utilizes image layer caching to
   * prevent rerunning the installDepsCmd in subsequent builds if the specified
   * required files are unchanged.
   */
  dependencies: {
    /** Command used to install dependencies */
    installDepsCmd: string;
    /** Files required by the above installDepsCmd */
    requiredFiles: string[];
  };
  /** Commands to control how your site is built */
  buildArtifacts: {
    /** Specifies the command to build your site */
    buildCmd: string;
  };
  /** Commands to control how Live Preview works */
  livePreview?: {
    /**
     * (optional): specifies a command to be executed by the live preview system before
     * executing serveCmd - this would be a good place to install any serve dependencies.
     */
    serveSetupCmd?: string;
    /** (optional): specifies a command to execute once the Live Preview container is online */
    serveCmd?: string;
    /**
     * (optional): specifies a command to watch files for changes and re-execute the build/serve
     * commands accordingly.
     * */
    watchCmd?: string;
  };
}

// TODO - ALEXIS

/**
 * Defines how the Yext CI system will produce artifacts for a site.
 */
export interface ArtifactStructure {
  /** Files that do not change (CSS, JavaScript bundles, images) */
  assets: Asset[];
  /** The path of the templates.config file */
  templates: string;
  /** Arbitrary functions that will be fired at pre-defined events in the build process */
  plugins?: Plugin[];
}

/**
 * Defines the source files of the {@link ArtifactStructure}.
 */
export interface Asset {
  /** The directory that contains the relevant files */
  root: string;
  /** (optional): defines the regex of files that are in-scope within the root directory */
  pattern?: string;
}

/**
 * Defines everything about a plugin for the Yext system.
 */
export interface Plugin {
  /** The name of the plugin */
  pluginName: string;
  /** Specifies the location of source files where the plugin is defined */
  sourceFiles: SourceFile[];
  /** The exact event when the plugin will be fired */
  event: PluginEvent;
  /** The entry-point for the plugin. This is the function that must be defined in the
   * source files and will be invoked upon event firing. */
  functionName: string;
  /** The route to host the plug in at */
  apiPath?: string;
}

/**
 * The set of plugin events available to the Yext system.
 */
export type PluginEvent = "ON_URL_CHANGE" | "ON_PAGE_GENERATE" | "API";

/**
 * Defines the source files of a {@link Plugin}.
 */
export interface SourceFile {
  /** The root path to find the plugin files */
  root: string;
  /** The pattern of file types to include */
  pattern: string;
}
