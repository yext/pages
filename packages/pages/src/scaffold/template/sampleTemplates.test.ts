import { describe, expect, it } from "vitest";
import {
  dynamicTemplate,
  newConfigFile,
  staticTemplate,
  visualEditorTemplateCode,
} from "./sampleTemplates.js";
import fs from "node:fs";
import { Diagnostic, Project, ts } from "ts-morph";

const filterOutModuleErrors = (d: Diagnostic<ts.Diagnostic>) => {
  return (
    !d.getMessageText().toString().includes("Cannot find module") &&
    !d.getMessageText().toString().includes("Cannot use JSX")
  );
};

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
        .filter(filterOutModuleErrors);
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
    const fileContent = visualEditorTemplateCode("testTemplate");
    const filePath = "test.tsx";

    try {
      fs.writeFileSync(filePath, fileContent);
      const project = new Project();
      project.addSourceFileAtPath(filePath);
      const diagnostics = project
        .getPreEmitDiagnostics()
        .filter(filterOutModuleErrors);
      expect(diagnostics.length).toBe(0);
    } finally {
      if (fs.existsSync("test.tsx")) {
        fs.unlinkSync("test.tsx");
      }
    }
  });
});

describe("staticTemplate", () => {
  it("confirm returned code has no warnings", () => {
    const fileContent = staticTemplate("testTemplate");
    const filePath = "test.tsx";

    try {
      fs.writeFileSync(filePath, fileContent);
      const project = new Project();
      project.addSourceFileAtPath(filePath);
      const diagnostics = project
        .getPreEmitDiagnostics()
        .filter(filterOutModuleErrors);
      expect(diagnostics.length).toBe(0);
    } finally {
      if (fs.existsSync("test.tsx")) {
        fs.unlinkSync("test.tsx");
      }
    }
  });
});

describe("dynamicTemplate", () => {
  it("confirm returned code has no warnings", () => {
    const fileContent = dynamicTemplate("testTemplate", "entityTypes", [
      "location",
    ]);
    const filePath = "test.tsx";

    try {
      fs.writeFileSync(filePath, fileContent);
      const project = new Project();
      project.addSourceFileAtPath(filePath);
      const diagnostics = project
        .getPreEmitDiagnostics()
        .filter(filterOutModuleErrors);
      expect(diagnostics.length).toBe(0);
    } finally {
      if (fs.existsSync("test.tsx")) {
        fs.unlinkSync("test.tsx");
      }
    }
  });
});
