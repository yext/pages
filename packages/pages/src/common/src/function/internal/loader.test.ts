import { describe, it, expect } from "vitest";
import path from "path";
import { loadFunctionModules, FunctionModuleCollection } from "./loader.js";
import { ProjectStructure } from "../../project/structure.js";

describe("loadTemplateModules", () => {
  const projectStructure = new ProjectStructure();

  it("loads and transpiles raw templates", async () => {
    const functionFile: path.ParsedPath[] = [
      path.parse(path.resolve("tests/fixtures/src/functions/http/[param].ts")),
    ];

    const functionModules = await loadFunctionModules(
      functionFile,
      true,
      projectStructure
    );
    commonTests(functionModules, "param-47543");
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
