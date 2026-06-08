import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readConfigYaml } from "./readConfigYaml.js";
import { ProjectStructure } from "../project/structure.js";
import { processEnvVariables } from "../../../util/processEnvVariables.js";
import { REVERSE_PROXY_PREFIX_ENV_VAR } from "../../../util/reverseProxyOverride.js";

vi.mock("../../../util/processEnvVariables.js", () => ({
  processEnvVariables: vi.fn(() => ({})),
}));

describe("readConfigYaml", () => {
  const projectStructure = new ProjectStructure({});

  afterEach(() => {
    if (fs.existsSync("config.yaml")) {
      fs.rmSync("config.yaml");
    }
    delete process.env[REVERSE_PROXY_PREFIX_ENV_VAR];
    vi.mocked(processEnvVariables).mockReset();
  });

  it("returns undefined when config.yaml does not exist", () => {
    expect(readConfigYaml(projectStructure)).toBeUndefined();
  });

  it("substitutes environment variables from config.yaml", () => {
    vi.mocked(processEnvVariables).mockReturnValueOnce({
      PREFIX: "www.brand.com/locations",
    });
    fs.writeFileSync(
      "config.yaml",
      `serving:
  reverseProxyPrefix: PREFIX
`
    );

    expect(readConfigYaml(projectStructure)).toEqual({
      serving: {
        reverseProxyPrefix: "www.brand.com/locations",
      },
    });
  });

  it("overrides reverse proxy config while preserving unrelated config", () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/locations";
    fs.writeFileSync(
      "config.yaml",
      `serving:
  reverseProxyPrefix: old.example.com/legacy
  customSetting: true
dynamicRoutes:
  - from: /health
    to: /internal/health
    status: 200
  - from: /assets/*
    to: /legacy/assets/:splat
    status: 302
sitemap:
  filename: sitemap.xml
`
    );

    expect(readConfigYaml(projectStructure)).toEqual({
      serving: {
        reverseProxyPrefix: "www.brand.com/locations",
        customSetting: true,
      },
      dynamicRoutes: [
        {
          from: "/health",
          to: "/internal/health",
          status: 200,
        },
        {
          from: "/assets/*",
          to: "/locations/assets/:splat",
          status: 200,
        },
      ],
      sitemap: {
        filename: "sitemap.xml",
      },
    });
  });

  it("adds the reverse proxy dynamic route when it is missing", () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/locations";
    fs.writeFileSync(
      "config.yaml",
      `serving:
  customSetting: true
`
    );

    expect(readConfigYaml(projectStructure)).toEqual({
      serving: {
        customSetting: true,
        reverseProxyPrefix: "www.brand.com/locations",
      },
      dynamicRoutes: [
        {
          from: "/assets/*",
          to: "/locations/assets/:splat",
          status: 200,
        },
      ],
    });
  });
});
