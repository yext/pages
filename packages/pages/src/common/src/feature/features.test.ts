import {
  convertTemplateConfigToFeatureConfig,
  convertTemplateConfigInternalToFeaturesConfig,
  FeatureConfig,
  FeaturesConfig,
} from "./features.js";
import { TemplateConfigInternal } from "../template/internal/types.js";
import { ProjectStructure } from "../project/structure.js";

describe("features - convertTemplateConfigToFeaturesConfig", () => {
  const projectStructure = new ProjectStructure();

  it("returns a FeaturesConfig with no StreamConfig if no stream is defined", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      streamId: "$id",
      hydrate: true,
    };

    const featuresConfig = convertTemplateConfigInternalToFeaturesConfig(
      templateConfig,
      projectStructure
    );

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
      },
    };

    const featuresConfig = convertTemplateConfigInternalToFeaturesConfig(
      templateConfig,
      projectStructure
    );

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
        },
      ],
    };

    expect(featuresConfig).toEqual(expected);
  });
});

describe("features - convertTemplateConfigToFeatureConfig", () => {
  const projectStructure = new ProjectStructure();

  it("uses the streamId if defined and return an EntityPageSetConfig", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: true,
      streamId: "$id",
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(
      templateConfig,
      projectStructure
    );

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      streamId: "$id",
      templateType: "JS",
      entityPageSet: {},
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
    };

    const featureConfig = convertTemplateConfigToFeatureConfig(
      templateConfig,
      projectStructure
    );

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
    };
    const featureConfig = convertTemplateConfigToFeatureConfig(
      templateConfig,
      projectStructure
    );

    const expected: FeatureConfig = {
      name: "myTemplateConfig",
      templateType: "JS",
      staticPage: {},
    };

    expect(featureConfig).toEqual(expected);
  });
});
