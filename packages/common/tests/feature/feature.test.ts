import { convertTemplateConfigToStreamConfig, StreamConfig } from '../../src/feature/stream';
import { TemplateConfig } from '../../src/template/types';

describe("feature", () => {
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