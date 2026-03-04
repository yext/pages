import { describe, it, expect, vi } from "vitest";
import { determineAssetsFilepath } from "./getAssetsFilepath.js";
import * as importHelper from "./import.js";

describe("getAssetsFilepath - determineAssetsFilepath", () => {
  it("returns assets when no files defined", async () => {
    const actual = await determineAssetsFilepath("assets", "");

    expect(actual).toEqual("assets");
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

  it("sanitizes absolute assetsDir to a safe relative path", async () => {
    const viteConfig = {
      default: {
        plugins: [],
        build: {
          assetsDir: "/my/subpath/assets",
        },
      },
    };

    const importSpy = vi.spyOn(importHelper, "import_");
    importSpy.mockImplementation(async () => viteConfig);

    const actual = await determineAssetsFilepath("assets", "does not matter since mocked");

    expect(actual).toEqual("my/subpath/assets");
  });

  it("falls back when assetsDir would escape the output directory", async () => {
    const viteConfig = {
      default: {
        plugins: [],
        build: {
          assetsDir: "../escape",
        },
      },
    };

    const importSpy = vi.spyOn(importHelper, "import_");
    importSpy.mockImplementation(async () => viteConfig);

    const actual = await determineAssetsFilepath("assets", "does not matter since mocked");

    expect(actual).toEqual("assets");
  });
});
