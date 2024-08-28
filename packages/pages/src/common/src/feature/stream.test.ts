import { describe, it, expect, vi, afterEach } from "vitest";
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
    const testJson = {
      $id: "site-stream",
      filter: { entityIds: ["1234", "123"] },
      localization: { locales: ["en"] },
      fields: [],
    };
    const mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    formatSiteStream(testJson, siteStreamPath);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("returns expected entityId", () => {
    const testJson = {
      $id: "site-stream",
      filter: { entityIds: ["1234"] },
      localization: { locales: ["en"] },
      fields: [],
    };
    const expectedJson = {
      id: "site-stream",
      entityId: "1234",
      localization: { locales: ["en"] },
      fields: [],
    };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });

  it("returns expected full config", () => {
    const testJson = {
      $id: "site-stream",
      fields: ["meta", "name"],
      filter: { entityIds: ["1234"] },
      source: "foo",
      localization: { locales: ["en"] },
    };
    const expectedJson = {
      id: "site-stream",
      entityId: "1234",
      fields: ["meta", "name"],
      localization: { locales: ["en"] },
    };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });
});

describe("readSiteStream", () => {
  afterEach(() => {
    if (fs.existsSync("config.yaml")) {
      fs.rmSync("config.yaml");
    }
    if (fs.existsSync("sites-config/site-stream.json")) {
      fs.rmSync("sites-config", { recursive: true, force: true });
    }
  });

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
  });

  it("reads siteStream from sites-config/sites-stream.json", () => {
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
  });
});
