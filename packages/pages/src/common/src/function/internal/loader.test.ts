import glob from "glob";
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
    const functionFile = glob.sync(
      path.join(process.cwd(), "tests/fixtures/function.ts")
    );
    const functionModules = await loadFunctionModules(
      functionFile,
      true,
      false
    );
    commonTests(functionModules);
  });

  it("loads transpiled templates", async () => {
    const functionFile = glob.sync(
      path.join(process.cwd(), "tests/fixtures/function.js")
    );
    const functionModules = await loadFunctionModules(
      functionFile,
      false,
      false
    );
    commonTests(functionModules);
  });

  const commonTests = (functionModules: FunctionModuleCollection) => {
    expect(functionModules.get("hello")).toBeTruthy();
    expect(functionModules.get("hello")?.config.name).toEqual(
      "Hello World Testing Function"
    );
    expect(functionModules.get("hello")?.config.event).toEqual("API");
    expect(functionModules.get("hello")?.config.functionName).toEqual(
      "helloWorld"
    );
    expect(functionModules.get("hello")?.slug).toEqual("hello");
  };
});
