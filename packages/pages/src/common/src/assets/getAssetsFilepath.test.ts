import { describe, it, expect, vi } from "vitest";
import { determineAssetsFilepath } from "./getAssetsFilepath.js";
import * as importHelper from "./import.js";

describe("getAssetsFilepath - determineAssetsFilepath", () => {
  it("returns assets when no files defined", async () => {
    const actual = await determineAssetsFilepath("assets", "", "");

    expect(actual).toEqual("assets");
  });

  it("returns custom assetsDir from config.yaml", async () => {
    const actual = await determineAssetsFilepath(
      "assets",
      "tests/fixtures/config.yaml",
      "tests/fixtures/vite.config.js"
    );

    expect(actual).toEqual("subpath/assets");
  });

  it("returns custom assets from vite config when no config.yaml", async () => {
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

    const actual = await determineAssetsFilepath(
      "assets",
      "tests/fixtures/invalid.yaml",
      "does not matter since mocked"
    );

    expect(actual).toEqual("viteConfigAssetsDir");
  });
});
