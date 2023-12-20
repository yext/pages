import { describe, it, expect } from "vitest";
import { removeFetchImport } from "./pagesUpdater.js";
import { Project } from "ts-morph";
import path from "path";
import fs from "fs";
import typescript from "typescript";

describe("test pages updater steps", () => {
  it("removes fetch imports", () => {
    const expectedBefore =
      'import { fetch, tacos } from "@yext/pages/util";\n' +
      'import fetch from "@fetch/fetcher";\n';
    const expectedAfter =
      'import { tacos } from "@yext/pages/util";\n' +
      'import fetch from "@fetch/fetcher";\n';

    // generate test file
    const testFilePath = "src/upgrade/test/src/templates/location.tsx";
    const source = path.resolve("src/upgrade/test/src");
    const testProject = new Project({
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
        sourceRoot: source,
      },
    });
    testProject.addSourceFilesAtPaths([
      `${source}/**/*.ts`,
      `${source}/**/*.tsx`,
      `${source}/**/*.js`,
      `${source}/**/*.jsx`,
    ]);
    let sourceFile = testProject.addSourceFileAtPathIfExists(testFilePath);
    if (!sourceFile) {
      sourceFile = testProject.createSourceFile(testFilePath);
    }
    sourceFile.addImportDeclaration({
      namedImports: ["fetch", "tacos"],
      moduleSpecifier: "@yext/pages/util",
    });
    sourceFile.addImportDeclaration({
      defaultImport: "fetch",
      moduleSpecifier: "@fetch/fetcher",
    });
    testProject.saveSync();
    const beforeContent = fs.readFileSync(path.resolve(testFilePath), "utf-8");

    // modify test file
    removeFetchImport(source);

    // validate changes
    const afterContent = fs.readFileSync(path.resolve(testFilePath), "utf-8");
    expect(beforeContent).toEqual(expectedBefore);
    expect(afterContent).toEqual(expectedAfter);
    sourceFile.delete();
    testProject.saveSync();
  });
});
