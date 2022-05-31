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
      name: "myTemplateConfig",
      streamId: "$id",
    };

    const featuresConfig =
      convertTemplateConfigToFeaturesConfig(templateConfig);

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
      convertTemplateConfigToFeaturesConfig(templateConfig);

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
      name: "myTemplateConfig",
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
      convertTemplateConfigFeatureConfig(templateConfig);

    expect(featureConfigFunc).toThrowError(
      `TemplateConfig must not define both a "streamId" and a "stream".`
    );
  });

  it("uses the streamId if defined and return an EntityPageSetConfig", async () => {
    const templateConfig: TemplateConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
    };

    const featureConfig = convertTemplateConfigFeatureConfig(templateConfig);

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

    const featureConfig = convertTemplateConfigFeatureConfig(templateConfig);

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

  it("returns a StaticPageConfig if no stream or streamId defined", async () => {
    const templateConfig: TemplateConfig = {
      name: "myTemplateConfig",
    };

    const featureConfig = convertTemplateConfigFeatureConfig(templateConfig);

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
