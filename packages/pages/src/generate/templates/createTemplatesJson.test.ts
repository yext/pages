import { describe, it, expect } from "vitest";
import { FeaturesConfig } from "../../common/src/feature/features.js";
import { TemplateModuleCollection } from "../../common/src/template/loader/loader.js";
import { getTemplatesConfig } from "./createTemplatesJson.js";
import { RedirectModuleCollection } from "../../common/src/redirect/loader/loader.js";
import { RedirectSource } from "../../common/src/redirect/types.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import fs from "node:fs";

describe("createTemplatesJsonFromModule - getFeaturesConfig", () => {
  it("creates the proper default templates structure", async () => {
    try {
      const testTemplateManifest = {
        templates: [
          {
            name: "main",
            description: "test",
            exampleSiteUrl: "",
            layoutRequired: true,
            defaultLayoutData: '{"root":{}, "zones":{}, "content":[]}',
          },
        ],
      };
      fs.writeFileSync(
        ".template-manifest.json",
        JSON.stringify(testTemplateManifest)
      );

      const templateModules: TemplateModuleCollection = new Map();
      templateModules.set("turtlehead-tacos", {
        path: "src/templates/static.tsx",
        filename: "static.tsx",
        templateName: "turtlehead-tacos",
        config: {
          name: "turtlehead-tacos",
          hydrate: true,
          templateType: "static",
        },
        getPath: () => {
          return "";
        },
      });
      templateModules.set("main", {
        path: "src/templates/c.tsx",
        filename: "main.tsx",
        templateName: "main",
        config: {
          name: "main",
          hydrate: true,
          templateType: "static",
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
          templateType: "entity",
        },
        getPath: () => {
          return "";
        },
      });

      const redirectModules: RedirectModuleCollection = new Map();
      redirectModules.set("closed-location", {
        config: {
          name: "closed-location",
          streamId: "closed-location-stream",
          stream: {
            $id: "closed-location-stream",
            fields: ["foo"],
            filter: {
              entityIds: ["97807061"],
            },
            localization: {
              locales: ["en"],
              primary: false,
            },
          },
        },
        filename: "closed-location.tsx",
        getDestination(): string {
          return "";
        },
        getSources(): RedirectSource[] {
          return [
            {
              source: "nomoretacos.com",
              statusCode: 301,
            },
          ];
        },
        path: "src/redirects/closed-location.tsx",
        redirectName: "closed-location",
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
          {
            name: "closed-location",
            streamId: "closed-location-stream",
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
          {
            $id: "closed-location-stream",
            filter: {
              entityIds: ["97807061"],
            },
            fields: ["foo"],
            localization: {
              locales: ["en"],
              primary: false,
            },
            source: "knowledgeGraph",
            destination: "pages",
          },
        ],
      };

      expect(
        getTemplatesConfig(
          templateModules,
          new ProjectStructure(),
          redirectModules
        )
      ).toEqual(expected);
    } finally {
      if (fs.existsSync(".template-manifest.json")) {
        fs.unlinkSync(".template-manifest.json");
      }
    }
  });
});
