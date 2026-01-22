import { describe, it, expect } from "vitest";
import { glob } from "glob";
import path from "path";
import { loadTemplateModules } from "./loader.js";
import { convertToPosixPath } from "../paths.js";
import { ProjectStructure } from "../../project/structure.js";

describe("loadTemplateModules", () => {
  it("loads and transpiles raw templates", async () => {
    const templateFile = glob.sync(
      convertToPosixPath(path.join(process.cwd(), "tests/fixtures/template.tsx"))
    );
    const templateModules = await loadTemplateModules(
      templateFile,
      true,
      false,
      new ProjectStructure()
    );

    expect(templateModules.get("template")?.config.name).toEqual("template");
  });

  it("loads transpiled templates", async () => {
    const templateFile = glob.sync(
      convertToPosixPath(path.join(process.cwd(), "tests/fixtures/template.js"))
    );
    const templateModules = await loadTemplateModules(
      templateFile,
      false,
      false,
      new ProjectStructure()
    );

    expect(templateModules.get("template")?.config.name).toEqual("template");
  });
});
