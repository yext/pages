import path from "path";

/**
 * Defines the folder paths where certain files live, relative to the root of the project.
 * 
 * @public
 */
export interface ProjectPathsConfig {
    /** The folder path where the template files live */
    templatesRoot: string;
    /** The folder path where the sites-config files live */
    sitesConfigRoot: string;
    /** The folder path where the compiled files should go */
    distRoot: string;
    /** The folder path where the compiled hydration bundles should go */
    hydrationBundleOutputRoot: string;
    /** The folder path where the compiled server bundles should go */
    serverBundleOutputRoot: string;
}

/**
 * Defines the names of certain files, including extension.
 * 
 * @public
 */
export interface ProjectFilesConfig {
    /** The name of the ci.json file */
    ciConfig: string;
    /** The name of the features.json file */
    featuresConfig: string;
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
        hydrationBundleOutputRoot: "dist/hydration_templates",
        serverBundleOutputRoot: "dist/assets/server",
    },
    filesConfig: {
        ciConfig: "ci.json",
        featuresConfig: "features.json",
    }
};
  
/**
 * Provides useful methods to operate on a configured project structure.
 * 
 * @public
 */
export class ProjectStructure {
    config: ProjectStructureConfig;

    constructor(config: ProjectStructureConfig = defaultConfig) {
        console.log(config);
        this.config = config;
    }

    getRelativePath = <T extends keyof ProjectPathsConfig>(pathType: T, to: string): string => {
        return `./${path.relative(this.config.pathsConfig[pathType], to)}`;
    }

    getAbsolutePath = <T extends keyof ProjectPathsConfig>(pathType: T): string => {
        return path.resolve(this.config.pathsConfig[pathType]);
    }
} 

