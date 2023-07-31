/**
 * The shape of data that represents a artifacts.config file, used by Yext Pages.
 */
export interface ArtifactsConfig {
  artifactStructure: ArtifactStructure;
}

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

export const defaultArtifactConfig: ArtifactsConfig = {
  artifactStructure: {
    assets: [],
    templates: "",
    plugins: [],
  },
};
