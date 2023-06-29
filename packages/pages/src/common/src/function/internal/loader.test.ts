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
        absolute: path.join(process.cwd(), "tests/fixtures/function.ts"),
        relative: "tests/fixtures/function",
        extension: ".ts",
      },
    ];

    const functionModules = await loadFunctionModules(functionFile, true);
    commonTests(functionModules);
  });

  it("loads transpiled templates", async () => {
    const functionFile: FunctionFilePath[] = [
      {
        absolute: path.join(process.cwd(), "tests/fixtures/function.js"),
        relative: "tests/fixtures/function",
        extension: "js",
      },
    ];
    const functionModules = await loadFunctionModules(functionFile, false);
    commonTests(functionModules);
  });

  const commonTests = (functionModules: FunctionModuleCollection) => {
    expect(functionModules.get("Hello World Testing Function")).toBeTruthy();
    expect(
      functionModules.get("Hello World Testing Function")?.config.name
    ).toEqual("Hello World Testing Function");
    expect(
      functionModules.get("Hello World Testing Function")?.config.event
    ).toEqual("API");
    expect(
      functionModules.get("Hello World Testing Function")?.config.functionName
    ).toEqual("default");
    expect(
      JSON.stringify(functionModules.get("Hello World Testing Function")?.slug)
    ).toEqual(
      JSON.stringify({
        original: "hello/[param]",
        dev: "hello/:param",
        production: "hello/{{param}}",
      })
    );
  };
});
