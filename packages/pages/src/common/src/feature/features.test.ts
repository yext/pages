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
    };

    const featuresConfig =
      convertTemplateConfigInternalToFeaturesConfig(templateConfig);

    const expected: FeaturesConfig = {
      features: [
        {
          name: "myTemplateConfig",
          streamId: "$id",
          templateType: "JS",
          entityPageSet: {
            plugin: {},
          },
        },
      ],
    };

    expect(featuresConfig).toEqual(expected);
  });

  it("returns a FeaturesConfig with a StreamConfig if stream is defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
    };

    const featuresConfig =
      convertTemplateConfigInternalToFeaturesConfig(templateConfig);

    const expected: FeaturesConfig = {
      features: [
        {
          name: "myTemplateConfig",
          streamId: "$id",
          templateType: "JS",
          entityPageSet: {
            plugin: {},
          },
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
      streamId: "$id",
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
      templateType: "JS",
      entityPageSet: {
        plugin: {},
      },
    };

    expect(featureConfig).toEqual(expected);
  });

  it("uses the stream if defined and returns an EntityPageSetConfig", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
      templateType: "JS",
      entityPageSet: {
        plugin: {},
      },
    };

    expect(featureConfig).toEqual(expected);
  });

  it("returns a StaticPageConfig if 'no config' defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
    };
    const featureConfig = convertTemplateConfigToFeatureConfig(templateConfig);

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      templateType: "JS",
      staticPage: {
        plugin: {},
      },
    };

    expect(featureConfig).toEqual(expected);
  });
});
