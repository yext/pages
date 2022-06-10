import {
  convertTemplateConfigFeatureConfig,
  convertTemplateConfigToFeaturesConfig,
  FeatureConfig,
  FeaturesConfig,
} from "../../src/feature/features";
import { TemplateConfig } from "../../src/template/types";

describe("features - convertTemplateConfigToFeaturesConfig", () => {
  it("returns a FeaturesConfig with no StreamConfig if no stream is defined", async () => {
    const templateConfig: TemplateConfig = {
      streamId: "$id",
    };

    const featuresConfig = convertTemplateConfigToFeaturesConfig(
      "myTemplateConfig",
      templateConfig
    );

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
    const templateConfig: TemplateConfig = {
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
    };

    const featuresConfig = convertTemplateConfigToFeaturesConfig(
      "myTemplateConfig",
      templateConfig
    );

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

describe("features - convertTemplateConfigFeatureConfig", () => {
  it("validates that both streamId and stream are not defined", async () => {
    const templateConfig: TemplateConfig = {
      streamId: "$id",
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
    };

    const featureConfigFunc = () =>
      convertTemplateConfigFeatureConfig("myTemplateConfig", templateConfig);

    expect(featureConfigFunc).toThrowError(
      `TemplateConfig must not define both a "streamId" and a "stream".`
    );
  });

  it("uses the streamId if defined and return an EntityPageSetConfig", async () => {
    const templateConfig: TemplateConfig = {
      streamId: "$id",
    };

    const featureConfig = convertTemplateConfigFeatureConfig(
      "myTemplateConfig",
      templateConfig
    );

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
    const templateConfig: TemplateConfig = {
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
    };

    const featureConfig = convertTemplateConfigFeatureConfig(
      "myTemplateConfig",
      templateConfig
    );

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

  it("returns a StaticPageConfig if no config defined", async () => {
    const featureConfig = convertTemplateConfigFeatureConfig(
      "myTemplateConfig",
      null
    );

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      templateType: "JS",
      staticPage: {
        plugin: {},
      },
    };

    expect(featureConfig).toEqual(expected);
  });

  it("overrides the config.name when defined", async () => {
    const templateConfig: TemplateConfig = {
      name: "myOverride",
      streamId: "$id",
    };

    const featuresConfig = convertTemplateConfigToFeaturesConfig(
      "myTemplateName",
      templateConfig
    );

    const expected: FeaturesConfig = {
      features: [
        {
          name: "myOverride",
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
});
