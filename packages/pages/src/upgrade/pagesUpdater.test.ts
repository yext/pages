import { describe, it, expect } from "vitest";
import { removeFetchImport } from "./pagesUpdater.js";
import { Project } from "ts-morph";
import path from "path";
import fs from "fs";

describe("test pages updater steps", () => {
  it("remove fetch imports", () => {
    const testFilePath = "src/upgrade/test/src/templates/location.tsx";
    const testProject = new Project();
    let sourceFile = testProject.addSourceFileAtPathIfExists(testFilePath);
    if (!sourceFile) {
      sourceFile = testProject.createSourceFile(testFilePath);
    }
    sourceFile.addImportDeclaration({
      namedImports: ["fetch"],
      moduleSpecifier: "@yext/pages/util",
    });
    testProject.saveSync();
    const beforeContent = fs.readFileSync(path.resolve(testFilePath), "utf-8");
    removeFetchImport(path.resolve("src/upgrade/test"));
    const afterContent = fs.readFileSync(path.resolve(testFilePath), "utf-8");
    expect(beforeContent).toContain("fetch");
    expect(afterContent).not.toContain("fetch");
    sourceFile.delete();
    testProject.saveSync();
  });
});
