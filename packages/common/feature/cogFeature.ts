import { Config } from "../templateModule/types";
import { convertConfigToValidFeatureFormat, FeatureConfig } from "./feature";
import { convertConfigToValidStreamFormat, StreamConfig } from "./stream";

export type CogFeatureConfig = {
    locales?: string[];
    features: FeatureConfig[];
    streams?: StreamConfig[];
}

export const convertConfigToValidCogFormat = (config: Config): CogFeatureConfig => {
    const featureConfig = convertConfigToValidFeatureFormat(config);
    const streamConfig = convertConfigToValidStreamFormat(config);

    return {
        features: [featureConfig],
        ...(streamConfig ? {streams: [streamConfig]} : "")
    }
}