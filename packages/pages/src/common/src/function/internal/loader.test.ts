import path from "path";
import { loadFunctionModules, FunctionModuleCollection } from "./loader.js";
import { FunctionFilePath } from "./types.js";

// our jest configuration doesn't support file urls so update pathToFileURL to do nothing during
// this test.
jest.mock("url", () => {
  const original = jest.requireActual("url");
  return {
    __esModule: true,
    ...original,
    pathToFileURL: (s: string) => s,
  };
});

afterAll(() => jest.unmock("url"));

describe("loadTemplateModules", () => {
  it("loads and transpiles raw templates", async () => {
    const functionFile: FunctionFilePath[] = [
      {
        absolute: path.join(
          process.cwd(),
          "tests/fixtures/src/functions/http/[param].ts"
        ),
        relative: "http/[param]",
        extension: ".ts",
        filename: "[param]",
      },
    ];

    const functionModules = await loadFunctionModules(functionFile, true);
    commonTests(functionModules);
  });

  it("loads transpiled templates", async () => {
    const functionFile: FunctionFilePath[] = [
      {
        absolute: path.join(
          process.cwd(),
          "tests/fixtures/src/functions/http/[param].js"
        ),
        relative: "http/[param]",
        extension: "js",
        filename: "[param]",
      },
    ];
    const functionModules = await loadFunctionModules(functionFile, false);
    commonTests(functionModules);
  });

  const commonTests = (functionModules: FunctionModuleCollection) => {
    expect(functionModules.get("[param]-90812")).toBeTruthy();
    expect(functionModules.get("[param]-90812")?.config.name).toEqual(
      "[param]-90812"
    );
    expect(functionModules.get("[param]-90812")?.config.event).toEqual("API");
    expect(functionModules.get("[param]-90812")?.config.functionName).toEqual(
      "default"
    );
    expect(JSON.stringify(functionModules.get("[param]-90812")?.slug)).toEqual(
      JSON.stringify({
        original: "[param]",
        dev: ":param",
        production: "{{param}}",
      })
    );
  };
});
