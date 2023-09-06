import path from "path";
import { loadFunctionModules, FunctionModuleCollection } from "./loader.js";
import { ProjectStructure } from "../../project/structure.js";
import { convertToOSPath } from "../../template/paths.js";

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

jest.mock("vite", () => {
  return {
    loadEnv: () => [],
  };
});

afterAll(() => jest.unmock("url"));

describe("loadTemplateModules", () => {
  const projectStructure = new ProjectStructure();

  it("loads and transpiles raw templates", async () => {
    const functionFile: path.ParsedPath[] = [
      path.parse(
        convertToOSPath("tests/fixtures/src/functions/http/[param].ts")
      ),
    ];

    const functionModules = await loadFunctionModules(
      functionFile,
      true,
      projectStructure
    );
    commonTests(functionModules, "param-19926");
  });

  it("loads transpiled templates", async () => {
    const functionFile: path.ParsedPath[] = [
      path.parse(path.resolve("tests/fixtures/src/functions/http/[param].js")),
    ];
    const functionModules = await loadFunctionModules(
      functionFile,
      false,
      projectStructure
    );
    commonTests(functionModules, "param-19616");
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
