import { describe, expect, it } from "vitest";
import { newConfigFile, visualEditorTemplateCode } from "./sampleTemplates.js";
import fs from "node:fs";
import { Project } from "ts-morph";

describe("newConfigFile", () => {
  it("confirm returned code has no warnings", () => {
    const fileContent = newConfigFile("testTemplate");
    const filePath = "test.tsx";

    try {
      fs.writeFileSync(filePath, fileContent);
      const project = new Project();
      project.addSourceFileAtPath(filePath);
      const diagnostics = project
        .getPreEmitDiagnostics()
        .filter(
          (d) =>
            !d
              .getMessageText()
              .toString()
              .includes("Cannot find module '@measured/puck'")
        );
      expect(diagnostics.length).toBe(0);
    } finally {
      if (fs.existsSync("test.tsx")) {
        fs.unlinkSync("test.tsx");
      }
    }
  });
});

describe("visualEditorTemplateCode", () => {
  it("confirm returned code has no warnings", () => {
    const fileContent = visualEditorTemplateCode(
      "testTemplate",
      "entityTypes",
      ["location"]
    );
    const filePath = "test.tsx";

    try {
      fs.writeFileSync(filePath, fileContent);
      const project = new Project();
      project.addSourceFileAtPath(filePath);
      const diagnostics = project
        .getPreEmitDiagnostics()
        .filter(
          (d) =>
            !d.getMessageText().toString().includes("Cannot find module") &&
            !d.getMessageText().toString().includes("Cannot use JSX")
        );
      expect(diagnostics.length).toBe(0);
    } finally {
      if (fs.existsSync("test.tsx")) {
        fs.unlinkSync("test.tsx");
      }
    }
  });
});
