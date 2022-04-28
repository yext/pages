export const FEATURE_CONFIG = {
  locales: ["en"],
  features: [
    {
      name: "index",
      streamId: "products",
      templateType: "JS",
      entityPageSet: {},
    },
  ],
  streams: [
    {
      $id: "products",
      source: "knowledgeGraph",
      destination: "pages",
      fields: [],
      filter: {},
      localization: {},
    },
  ],
};
