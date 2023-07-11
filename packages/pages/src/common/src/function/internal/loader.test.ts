import path from "path";
import { loadFunctionModules, FunctionModuleCollection } from "./loader.js";

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
    const functionFile: path.ParsedPath[] = [
      path.parse("tests/fixtures/src/functions/http/[param].ts"),
    ];

    const functionModules = await loadFunctionModules(functionFile, true);
    commonTests(functionModules, "param-47543");
  });

  it("loads transpiled templates", async () => {
    const functionFile: path.ParsedPath[] = [
      path.parse(path.resolve("tests/fixtures/src/functions/http/[param].js")),
    ];
    const functionModules = await loadFunctionModules(functionFile, false);
    commonTests(functionModules, "param-47853");
  });

  const commonTests = (
    functionModules: FunctionModuleCollection,
    functionName: string
  ) => {
    expect(functionModules.get(functionName)).toBeTruthy();
    expect(functionModules.get(functionName)?.config.name).toEqual(
      functionName
    );
    expect(functionModules.get(functionName)?.config.event).toEqual("API");
    expect(functionModules.get(functionName)?.config.functionName).toEqual(
      "default"
    );
    expect(JSON.stringify(functionModules.get(functionName)?.slug)).toEqual(
      JSON.stringify({
        original: "[param]",
        dev: ":param",
        production: "{{param}}",
      })
    );
  };
});
