import { describe, it, expect } from "vitest";
import path from "node:path";
import createTestSourceFile from "../../../util/createTestSourceFile.js";
import SourceFileParser from "./sourceFileParser.js";
import TemplateParser from "./templateParser.js";

describe("makeClientTemplate", () => {
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
});

function createParser(sourceCode: string) {
  const filepath = path.resolve(__dirname, "test.tsx");
  const { project } = createTestSourceFile(sourceCode, filepath);
  return new SourceFileParser(filepath, project);
}
