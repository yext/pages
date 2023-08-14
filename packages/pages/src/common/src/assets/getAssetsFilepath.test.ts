import { determineAssetsFilepath } from "./getAssetsFilepath.js";
import * as importHelper from "./import.js";

describe("getAssetsFilepath - determineAssetsFilepath", () => {
  it("returns assets when no files defined", async () => {
    const actual = await determineAssetsFilepath("assets", "", "");

    expect(actual).toEqual("assets");
  });

  it("returns custom assets from serving.json", async () => {
    const actual = await determineAssetsFilepath(
      "assets",
      "tests/fixtures/serving.json",
      "tests/fixtures/vite.config.js"
    );

    expect(actual).toEqual("servingJsonAssetsDir");
  });

  it("returns custom assets from vite config when no serving.json", async () => {
    const viteConfig = {
      default: {
        plugins: [],
        build: {
          assetsDir: "viteConfigAssetsDir",
        },
      },
    };

    const importSpy = jest.spyOn(importHelper, "import_");
    importSpy.mockImplementation(async () => viteConfig);

    const actual = await determineAssetsFilepath(
      "assets",
      "tests/fixtures/invalid.json",
      "does not matter since mocked"
    );

    expect(actual).toEqual("viteConfigAssetsDir");
  });
});
