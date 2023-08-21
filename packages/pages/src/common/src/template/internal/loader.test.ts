import { glob } from "glob";
import path from "path";
import { loadTemplateModules } from "./loader.js";

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
  it("loads and transpiles raw templates", async () => {
    const templateFile = glob.sync(
      path.join(process.cwd(), "tests/fixtures/template.tsx")
    );
    const templateModules = await loadTemplateModules(
      templateFile,
      true,
      false
    );

    expect(templateModules.get("template")?.config.name).toEqual("template");
  });

  it("loads transpiled templates", async () => {
    const templateFile = glob.sync(
      path.join(process.cwd(), "tests/fixtures/template.js")
    );
    const templateModules = await loadTemplateModules(
      templateFile,
      false,
      false
    );

    expect(templateModules.get("template")?.config.name).toEqual("template");
  });
});
