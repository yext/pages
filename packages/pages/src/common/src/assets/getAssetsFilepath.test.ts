import { afterEach, describe, it, expect, vi } from "vitest";
import { determineAssetsFilepath } from "./getAssetsFilepath.js";
import * as importHelper from "./import.js";
import { REVERSE_PROXY_PREFIX_ENV_VAR } from "../../../util/reverseProxyOverride.js";

describe("getAssetsFilepath - determineAssetsFilepath", () => {
  afterEach(() => {
    delete process.env[REVERSE_PROXY_PREFIX_ENV_VAR];
  });

  it("returns assets when no files defined", async () => {
    const actual = await determineAssetsFilepath("assets", "");

    expect(actual).toEqual("assets");
  });

  it("returns reverse proxy assets when the env var is present", async () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/locations";

    const actual = await determineAssetsFilepath("assets", "");

    expect(actual).toEqual("locations/assets");
  });

  it("returns custom assets from vite config", async () => {
    const viteConfig = {
      default: {
        plugins: [],
        build: {
          assetsDir: "viteConfigAssetsDir",
        },
      },
    };

    const importSpy = vi.spyOn(importHelper, "import_");
    importSpy.mockImplementation(async () => viteConfig);

    const actual = await determineAssetsFilepath("assets", "does not matter since mocked");

    expect(actual).toEqual("viteConfigAssetsDir");
  });
});
