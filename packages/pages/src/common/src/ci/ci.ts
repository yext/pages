/**
 * The shape of data that represents a ci.json file, used by Yext Pages.
 */
export interface CiConfig {
  artifactStructure: ArtifactStructure;
  dependencies: {
    installDepsCmd: string;
    requiredFiles: string[];
  };
  buildArtifacts: {
    buildCmd: string;
  };
  livePreview: {
    serveSetupCmd: string;
  };
}

export interface ArtifactStructure {
  assets: Asset[];
  /** The location of the features.json file */
  features: string;
  plugins?: Plugin[];
}

export interface Asset {
  root: string;
  pattern: string;
}

export interface Plugin {
  pluginName: string;
  sourceFiles: SourceFile[];
  event: string;
  functionName: string;
}

export interface SourceFile {
  root: string;
  pattern: string;
}
