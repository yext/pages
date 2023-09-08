import { FeaturesConfig } from "../../common/src/feature/features.js";
import { TemplateModuleCollection } from "../../common/src/template/internal/loader.js";
import { getFeaturesConfig } from "./createTemplatesJsonFromModule.js";

describe("createTemplatesJsonFromModule - getFeaturesConfig", () => {
  it("creates the proper default templates structure", async () => {
    const templateModules: TemplateModuleCollection = new Map();
    templateModules.set("turtlehead-tacos", {
      path: "src/templates/static.tsx",
      filename: "static.tsx",
      templateName: "turtlehead-tacos",
      config: {
        name: "turtlehead-tacos",
        hydrate: true,
      },
      getPath: () => {
        return "";
      },
    });
    templateModules.set("location", {
      path: "src/templates/location.tsx",
      filename: "location.tsx",
      templateName: "location",
      config: {
        name: "location",
        hydrate: true,
        streamId: "location-stream",
        stream: {
          $id: "location-stream",
          fields: ["foo"],
          filter: {
            entityIds: ["97807061"],
          },
          localization: {
            locales: ["en"],
            primary: false,
          },
          transform: {
            replaceOptionValuesWithDisplayNames: ["paymentOptions"],
          },
        },
      },
      getPath: () => {
        return "";
      },
    });

    const expected: FeaturesConfig = {
      features: [
        {
          name: "turtlehead-tacos",
          templateType: "JS",
          staticPage: {},
          streamId: undefined,
          alternateLanguageFields: undefined,
        },
        {
          name: "location",
          streamId: "location-stream",
          templateType: "JS",
          entityPageSet: {},
          alternateLanguageFields: undefined,
        },
      ],
      streams: [
        {
          $id: "location-stream",
          filter: {
            entityIds: ["97807061"],
          },
          fields: ["foo"],
          localization: {
            locales: ["en"],
            primary: false,
          },
          transform: {
            replaceOptionValuesWithDisplayNames: ["paymentOptions"],
          },
          source: "knowledgeGraph",
          destination: "pages",
        },
      ],
    };

    expect(getFeaturesConfig(templateModules)).toEqual(expected);
  });
});
