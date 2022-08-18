import glob from "glob";
import path from "path";
import { loadTemplateModules } from "./loader";

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
