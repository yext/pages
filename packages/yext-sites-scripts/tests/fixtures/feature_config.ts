import { FeaturesConfig } from "../../../common/src/feature/features";

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
      transform: {},
    },
  ],
};
