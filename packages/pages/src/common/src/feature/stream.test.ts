import { describe, it, expect, vi } from "vitest";
import {
  convertTemplateConfigToStreamConfig,
  StreamConfig,
  formatSiteStream,
  readSiteStream,
} from "./stream.js";
import { TemplateConfigInternal } from "../template/internal/types.js";
import fs from "fs";
import { ProjectStructure } from "../project/structure.js";

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

const siteStreamPath = "foo/bar";

describe("formatSiteStream", () => {
  it("errors and exits when there are multiple entityIds", () => {
    const testJson = { filter: { entityIds: ["1234", "123"] } };
    const mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    formatSiteStream(testJson, siteStreamPath);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("returns expected entityId", () => {
    const testJson = { filter: { entityIds: ["1234"] } };
    const expectedJson = { entityId: "1234" };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });

  it("returns expected id with id first", () => {
    const testJson = { fields: ["meta", "name"], $id: "123" };
    const expectedJson = { id: "123", fields: ["meta", "name"] };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });

  it("returns expected full config", () => {
    const testJson = {
      $id: "123",
      fields: ["meta", "name"],
      filter: { entityIds: ["1234"] },
      source: "foo",
      localization: ["en"],
    };
    const expectedJson = {
      id: "123",
      entityId: "1234",
      fields: ["meta", "name"],
      localization: ["en"],
    };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });
});

describe("readSiteStream", () => {
  const projectStructure = new ProjectStructure({});

  it("reads siteStream from config.yaml", () => {
    const path = "config.yaml";
    fs.writeFileSync(
      path,
      `siteStream:
        id: site-stream
        entityId: site-stream-from-yaml
        fields:
          - c_visualLayouts.c_visualConfiguration
        localization:
          locales:
            - en
      `
    );
    const siteStream = readSiteStream(projectStructure);
    expect(siteStream).toEqual({
      id: "site-stream",
      entityId: "site-stream-from-yaml",
      fields: ["c_visualLayouts.c_visualConfiguration"],
      localization: { locales: ["en"] },
    });
    fs.rmSync(path);
  });

  it("reads siteStream from config.yaml", () => {
    projectStructure.getSitesConfigPath;
    const path = "sites-config/site-stream.json";
    fs.mkdirSync("sites-config");
    fs.writeFileSync(
      path,
      `
      {
        "$id": "site-stream",
        "filter": {
          "entityIds": ["site-stream-from-json"]
        },
        "fields": ["c_visualLayouts.c_visualConfiguration"],
        "localization": {"locales": ["en"]}
      }
      `
    );
    const siteStream = readSiteStream(projectStructure);
    expect(siteStream).toEqual({
      id: "site-stream",
      entityId: "site-stream-from-json",
      fields: ["c_visualLayouts.c_visualConfiguration"],
      localization: { locales: ["en"] },
    });
    fs.rmSync(path);
    fs.rmdirSync("sites-config");
  });
});
