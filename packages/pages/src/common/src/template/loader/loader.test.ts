import { describe, it, expect } from "vitest";
import { glob } from "glob";
import path from "path";
import { loadTemplateModules } from "./loader.js";
import { convertToPosixPath } from "../paths.js";
import { ProjectStructure } from "../../project/structure.js";
import fs from "node:fs";

describe("loadTemplateModules", () => {
  it("loads and transpiles raw templates", async () => {
    const templateFile = glob.sync(
      convertToPosixPath(
        path.join(process.cwd(), "tests/fixtures/template.tsx")
      )
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

  it("ignores in-platform page set templates", async () => {
    try {
      const templateFiles = glob.sync([
        convertToPosixPath(
          path.join(process.cwd(), "tests/fixtures/inPlatformTemplate.tsx")
        ),
        convertToPosixPath(
          path.join(process.cwd(), "tests/fixtures/template.tsx")
        ),
      ]);

      const testTemplateManifest = {
        templates: [
          {
            name: "inPlatformTemplate",
            description: "test",
            exampleSiteUrl: "",
            layoutRequired: true,
            defaultLayoutData: '{"root":{}, "zones":{}, "content":[]}',
          },
        ],
      };

      fs.writeFileSync(
        ".template-manifest.json",
        JSON.stringify(testTemplateManifest)
      );

      const templateModules = await loadTemplateModules(
        templateFiles,
        false,
        false,
        new ProjectStructure()
      );

      expect(templateModules.get("inPlatformTemplate")).toBeUndefined();
      expect(templateModules.get("template")?.config.name).toEqual("template");
    } finally {
      if (fs.existsSync(".template-manifest.json")) {
        fs.unlinkSync(".template-manifest.json");
      }
    }
  });
});
