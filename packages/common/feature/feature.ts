import { Config } from "../templateModule/types";

interface FeatureConfigBase {
  name: string;
  streamId: string;
  templateType: "JS";
}

interface EntityPageSetConfig extends FeatureConfigBase {
  entityPageSet: {
    plugin: {};
  };
}
interface StaticPageConfig extends FeatureConfigBase {
  staticPage: {
    plugin: {};
  };
}

export type FeatureConfig = EntityPageSetConfig | StaticPageConfig;

export const convertConfigToValidFeatureFormat = (
  config: Config
): FeatureConfig => {
  const streamConfig = config.stream || null;

  let featureConfigBase: FeatureConfigBase = {
    name: config.name,
    streamId: streamConfig
      ? streamConfig.$id
      : config.streamId
      ? config.streamId
      : "",
    templateType: "JS",
  };

  let featureConfig: FeatureConfig;
  if (!config.streamId && (!streamConfig || !streamConfig.$id)) {
    featureConfig = {
      ...featureConfigBase,
      staticPage: {
        plugin: {},
      },
    };
  } else {
    featureConfig = {
      ...featureConfigBase,
      entityPageSet: {
        plugin: {},
      },
    };
  }

  return featureConfig;
};
