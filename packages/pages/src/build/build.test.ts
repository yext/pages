import { afterEach, describe, expect, it, vi } from "vitest";
import { build } from "vite";
import { buildHandler } from "./build.js";
import { REVERSE_PROXY_PREFIX_ENV_VAR } from "../util/reverseProxyOverride.js";

vi.mock("vite", () => ({
  build: vi.fn(),
}));

vi.mock("../util/viteConfig.js", () => ({
  scopedViteConfigPath: vi.fn(() => "vite.config.js"),
}));

describe("buildHandler", () => {
  afterEach(() => {
    delete process.env[REVERSE_PROXY_PREFIX_ENV_VAR];
    vi.clearAllMocks();
  });

  it("sets the reverse proxy env var when the flag is provided", async () => {
    await buildHandler({
      pluginFilesizeLimit: 10,
      pluginTotalFilesizeLimit: 20,
      reverseProxyPrefix: "www.brand.com/locations",
    });

    expect(process.env[REVERSE_PROXY_PREFIX_ENV_VAR]).toEqual("www.brand.com/locations");
    expect(build).toHaveBeenCalledWith({
      configFile: "vite.config.js",
    });
  });

  it("clears the reverse proxy env var when the flag is absent", async () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/legacy";

    await buildHandler({
      pluginFilesizeLimit: 10,
      pluginTotalFilesizeLimit: 20,
    });

    expect(process.env[REVERSE_PROXY_PREFIX_ENV_VAR]).toBeUndefined();
  });
});
