import { convertTemplateConfigToStreamConfig, StreamConfig } from "../../src/feature/stream";
import { TemplateConfig } from "../../src/template/types";

describe("stream", () => {
  it("returns void if no stream", async () => {
    const templateConfig: TemplateConfig = {
      name: "myTemplateConfig",
    };
    
    const streamConfig = convertTemplateConfigToStreamConfig(templateConfig);

    expect(streamConfig).toEqual(void 0);
  });

  it("adds source and destination if streamConfig defined", async () => {
    const templateConfig: TemplateConfig = {
      name: "myTemplateConfig",
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        }
      }
    };
    
    const streamConfig = convertTemplateConfigToStreamConfig(templateConfig);
    const expectedStreamConfig: StreamConfig = {
      $id: "$id",
      source: "knowledgeGraph",
      "destination": "pages",
      fields: ["foo"],
      filter: {},
      localization: {
        primary: true,
      }
    };

    expect(streamConfig).toEqual(expectedStreamConfig);
  });
});