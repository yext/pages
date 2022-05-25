import { Config } from "../templateModule/types";

export type StreamConfig = {
  $id: string;
  source: string;
  destination: string;
  fields: string[];
  filter: {
    entityTypes?: string[];
    savedFilterIds?: string[];
  };
  localization: {
    locales: string[];
    primary: boolean;
  };
};

export const convertConfigToValidStreamFormat = (
  config: Config
): StreamConfig | void => {
  if (config.stream) {
    return {
      ...config.stream,
      source: "knowledgeGraph",
      destination: "pages",
    };
  }
};
