import { describe, it, expect } from "vitest";
import { convertTemplateConfigToStreamConfig, StreamConfig } from "./stream.js";
import { TemplateConfigInternal } from "../template/internal/types.js";

describe("stream", () => {
  it("returns void if no stream", async () => {
    const templateConfig: TemplateConfigInternal = {
      name: "myTemplateConfig",
      hydrate: false,
      templateType: "static",
    };

    const streamConfig = convertTemplateConfigToStreamConfig(templateConfig);

    expect(streamConfig).toEqual(void 0);
  });

  it("adds source and destination if StreamConfig defined", async () => {
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

    const streamConfig = convertTemplateConfigToStreamConfig(templateConfig);
    const expectedStreamConfig: StreamConfig = {
      $id: "$id",
      source: "knowledgeGraph",
      destination: "pages",
      fields: ["foo"],
      filter: {},
      localization: {
        primary: true,
      },
    };

    expect(streamConfig).toEqual(expectedStreamConfig);
  });
});
