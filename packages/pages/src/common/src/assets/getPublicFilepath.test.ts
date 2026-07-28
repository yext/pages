import { describe, it, expect, vi } from "vitest";
import { determinePublicFilepath } from "./getPublicFilepath.js";
import * as importHelper from "./import.js";

describe("getPublicFilepath - determinePublicFilepath", () => {
  it("returns public when no files defined", async () => {
    const actual = await determinePublicFilepath("public", "");

    expect(actual).toEqual("public");
  });

  it("returns custom public from vite config", async () => {
    const viteConfig = {
      default: {
        plugins: [],
        publicDir: "viteConfigPublicDir",
      },
    };

    vi.spyOn(importHelper, "versionedFileUrl").mockReturnValue("versioned file path");
    const importSpy = vi.spyOn(importHelper, "import_");
    importSpy.mockImplementation(async () => viteConfig);

    const actual = await determinePublicFilepath("public", "does not matter since mocked");

    expect(actual).toEqual("viteConfigPublicDir");
  });
});
