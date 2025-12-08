import { describe, it, expect } from "vitest";
import {
  convertTemplateConfigToFeatureConfig,
  convertTemplateConfigInternalToFeaturesConfig,
  FeatureConfig,
  FeaturesConfig,
} from "./features.js";
import { TemplateConfigInternal } from "../template/internal/types.js";

describe("features - convertTemplateConfigToFeaturesConfig", () => {
  it("returns a FeaturesConfig with no StreamConfig if no stream is defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      streamId: "$id",
      hydrate: true,
      templateType: "entity",
    };

    const featuresConfig =
      convertTemplateConfigInternalToFeaturesConfig(templateConfig);

    const expected: FeaturesConfig = {
      features: [
        {
          name: "myTemplateConfig",
          streamId: "$id",
          templateType: "JS",
          entityPageSet: {},
        },
      ],
    };

    expect(featuresConfig).toEqual(expected);
  });

  it("returns a FeaturesConfig with a StreamConfig if stream is defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: true,
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
        includeBrandCertifiedFacts: true,
      },
      templateType: "entity",
    };

    const featuresConfig =
      convertTemplateConfigInternalToFeaturesConfig(templateConfig);

    const expected: FeaturesConfig = {
      features: [
        {
          name: "myTemplateConfig",
          streamId: "$id",
          templateType: "JS",
          entityPageSet: {},
        },
      ],
      streams: [
        {
          $id: "$id",
          source: "knowledgeGraph",
          destination: "pages",
          fields: ["foo"],
          filter: {},
          localization: {
            primary: true,
          },
          includeBrandCertifiedFacts: true,
        },
      ],
    };

    expect(featuresConfig).toEqual(expected);
  });
});

describe("features - convertTemplateConfigToFeatureConfig", () => {
  it("uses the streamId if defined and return an EntityPageSetConfig", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: true,
      streamId: "$id",
      templateType: "entity",
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
      templateType: "JS",
      entityPageSet: {},
    };

    expect(featureConfig).toEqual(expected);
  });

  it("return an EntityPageSetConfig with an entityPageSet.pageUrlField property when both streamId and pageUrlField are defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: true,
      streamId: "$id",
      pageUrlField: "myPageUrlField",
      templateType: "entity",
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
      templateType: "JS",
      entityPageSet: {
        pageUrlField: "myPageUrlField",
      },
    };

    expect(featureConfig).toEqual(expected);
  });

  it("uses the stream if defined and returns an EntityPageSetConfig", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: true,
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
      templateType: "entity",
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
      templateType: "JS",
      entityPageSet: {},
    };

    expect(featureConfig).toEqual(expected);
  });

  it("returns a StaticPageConfig if 'no config' defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: true,
      templateType: "static",
    };
    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      templateType: "JS",
      staticPage: {},
    };

    expect(featureConfig).toEqual(expected);
  });
});
