import { FeaturesConfig } from "../../src/common/src/feature/features";

export const FEATURE_CONFIG: FeaturesConfig = {
  features: [
    {
      name: "index",
      streamId: "products",
      templateType: "JS",
      entityPageSet: {
        plugin: {},
      },
    },
  ],
  streams: [
    {
      $id: "products",
      source: "knowledgeGraph",
      destination: "pages",
      fields: [],
      filter: {},
      localization: {
        primary: false,
      },
    },
  ],
};

export const FEATURE_CONFIG_ALTERNATE_LANGUAGE_FIELDS: FeaturesConfig = {
  features: [
    {
      name: "index",
      streamId: "products",
      templateType: "JS",
      entityPageSet: {
        plugin: {},
      },
      alternateLanguageFields: ["name"],
    },
  ],
  streams: [
    {
      $id: "products",
      source: "knowledgeGraph",
      destination: "pages",
      fields: [],
      filter: {},
      localization: {
        primary: false,
      },
    },
  ],
};
