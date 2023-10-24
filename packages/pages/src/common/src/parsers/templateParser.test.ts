import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import createTestSourceFile from "../../../util/createTestSourceFile.js";
import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";
import TemplateParser from "./templateParser.js";

describe("simple makeClientTemplate usages", () => {
  it("correctly returns expected file contents", () => {
    const sourceParser = createParser(`const foo = 5; export default foo`);
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).toContain(`const foo = 5;`);
    expect(templateParser.fileContents).toContain(`export default foo`);
  });

  it("does not return unnecessary contents ", () => {
    const sourceParser = createParser(
      `const foo = 5; const bar = 7; export default foo`
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).not.toContain(`const bar = 7;`);
    expect(templateParser.fileContents).toContain(`const foo = 5;`);
    expect(templateParser.fileContents).toContain(`export default foo`);
  });

  it("correctly returns child expressions", () => {
    const sourceParser = createParser(
      `const foo = bar + 5; const bar = 7; export default foo`
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).toContain(`const foo = bar + 5;`);
    expect(templateParser.fileContents).toContain(`const bar = 7;`);
    expect(templateParser.fileContents).toContain(`export default foo`);
  });

  it("correctly returns imports", () => {
    const sourceParser = createParser(
      `import { Template, TemplateRenderProps } from "@yext/pages"; 
      const foo: Template<TemplateRenderProps> = () => { return (<></>); };
      export default foo;`
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).toContain(
      `import { Template, TemplateRenderProps } from "@yext/pages";`
    );
  });

  it("does not return unnecessary imports", () => {
    const sourceParser = createParser(
      `import { Template, TemplateRenderProps } from "@yext/pages";`
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).not.toContain(
      `import { Template, TemplateRenderProps } from "@yext/pages";`
    );
  });

  it("does not return tsdoc comments", () => {
    const sourceParser = createParser(
      `/**
      * mock tsdoc comments
      */
      const foo = 5;
      export default foo`
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).not.toContain(` mock tsdoc comments`);
  });
});

describe("complex makeClientTemplate usages", () => {
  it("correctly returns expected file contents for static template", () => {
    const sourceParser = new SourceFileParser(
      "./tests/fixtures/sourceFileTemplates/static.tsx",
      createTsMorphProject()
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    const expectedContents = fs.readFileSync(
      "./tests/fixtures/sourceFileTemplates/clientStatic.tsx",
      "utf-8"
    );
    expect(templateParser.fileContents).toEqual(expectedContents);
  });

  it("correctly returns expected file contents for entity template", () => {
    const sourceParser = new SourceFileParser(
      "./tests/fixtures/sourceFileTemplates/state.tsx",
      createTsMorphProject()
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    const expectedContents = fs.readFileSync(
      "./tests/fixtures/sourceFileTemplates/clientState.tsx",
      "utf-8"
    );
    expect(templateParser.fileContents).toEqual(expectedContents);
  });

  it("correctly returns nothing for templates without default export", () => {
    const sourceParser = new SourceFileParser(
      "./tests/fixtures/sourceFileTemplates/robots.tsx",
      createTsMorphProject()
    );
    const testParser = createParser(``);
    const templateParser = new TemplateParser(
      sourceParser
    ).makeClientTemplateFromSfp(testParser);
    expect(templateParser.fileContents).toEqual("");
  });
});

function createParser(sourceCode: string) {
  const filepath = path.resolve(__dirname, "test.tsx");
  const { project } = createTestSourceFile(sourceCode, filepath);
  return new SourceFileParser(filepath, project);
}
