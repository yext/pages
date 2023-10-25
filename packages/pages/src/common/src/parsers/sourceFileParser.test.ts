import { describe, it, expect } from "vitest";
import path from "node:path";
import createTestSourceFile from "../../../util/createTestSourceFile.js";
import SourceFileParser from "./sourceFileParser.js";

describe("getDefaultExport", () => {
  it("correctly gets default export's name when function", () => {
    const parser = createParser(
      `export const no = false; export default function test() {}`
    );
    const defaultExport = parser.getDefaultExport();
    expect(defaultExport).toBe("test");
  });

  it("correctly gets default export's name when variable", () => {
    const parser = createParser(`const test = 5; export default test`);
    const defaultExport = parser.getDefaultExport();
    expect(defaultExport).toBe("test");
  });
});

describe("addDefaultExport", () => {
  it("correctly adds default export to file", () => {
    const parser = createParser(``);
    parser.addDefaultExport("test");
    expect(parser.getDefaultExport()).toBe("test");
  });
});

describe("getExpressionByName", () => {
  it("correctly returns variable expression when given name", () => {
    const parser = createParser(`const foo = 5; const bar = 7;`);
    const expression = parser.getExpressionByName("foo");
    expect(expression).toBe("const foo = 5;");
  });

  it("correctly returns function expression when given name", () => {
    const parser = createParser(`function foo(){} const bar = 7;`);
    const expression = parser.getExpressionByName("foo");
    expect(expression).toBe("function foo(){}");
  });

  it("correctly returns empty string when expression doesn't exist", () => {
    const parser = createParser(`const test = 5;`);
    const expression = parser.getExpressionByName("foo");
    expect(expression).toBe("");
  });
});

describe("addExpressions", () => {
  it("correctly adds expression to file", () => {
    const parser = createParser(``);
    parser.addExpressions(["const test = 5;"]);
    expect(parser.getExpressionByName("test")).toBe("const test = 5;");
  });
});

describe("getAllImports", () => {
  it("correctly gets all imports from file", () => {
    const parser = createParser(
      `import * as React from "react"; import Template from "@yext/pages";`
    );
    const imports = parser.getAllImports();
    expect(imports[0].moduleSpecifier).toBe("react");
    expect(imports[1].moduleSpecifier).toBe("@yext/pages");
  });

  it("handles file having no imports", () => {
    const parser = createParser(`const test = 5;`);
    const imports = parser.getAllImports();
    expect(imports).toEqual([]);
  });

  it("handles multiple named imports from one path", () => {
    const parser = createParser(
      `import {Template, TemplateConfig, TemplateProps} from "@yext/pages";`
    );
    const imports = parser.getAllImports();
    expect(imports[0].namedImports).toEqual([
      "Template",
      "TemplateConfig",
      "TemplateProps",
    ]);
  });

  it("handles named imports and default imports from one path", () => {
    const parser = createParser(
      `import Foo, {Template, TemplateConfig, TemplateProps} from "@yext/pages";`
    );
    const imports = parser.getAllImports();
    expect(imports[0].namedImports).toEqual([
      "Template",
      "TemplateConfig",
      "TemplateProps",
    ]);
    expect(imports[0].defaultImport).toBe("Foo");
  });
});

describe("setAllImports", () => {
  it("correctly sets an import into file", () => {
    const parser = createParser(``);
    parser.setAllImports([
      {
        moduleSpecifier: "index.css",
      },
    ]);
    const imports = parser.getAllImports();
    expect(imports.length).toEqual(1);
    expect(imports[0].moduleSpecifier).toBe("index.css");
  });

  it("handles having no imports to set", () => {
    const parser = createParser(``);
    parser.setAllImports([]);
    const imports = parser.getAllImports();
    expect(imports).toEqual([]);
  });
});

describe("getChildExpressions", () => {
  it("correctly gets a child const", () => {
    const parser = createParser(`const foo = 4; const bar = foo + 3;`);
    const childExpressions = ["bar"];
    parser.getChildExpressions("bar", childExpressions);
    expect(childExpressions).toEqual(["bar", "foo"]);
  });

  it("correctly gets a child function", () => {
    const parser = createParser(
      `function foo(){ return 4;} const bar = foo() + 3;`
    );
    const childExpressions = ["bar"];
    parser.getChildExpressions("bar", childExpressions);
    expect(childExpressions).toEqual(["bar", "foo"]);
  });

  it("handles having no child expressions", () => {
    const parser = createParser(`const foo = 4; const bar = 3;`);
    const childExpressions = ["bar"];
    parser.getChildExpressions("bar", childExpressions);
    expect(childExpressions).toEqual(["bar"]);
  });

  it("handles getting invalid expression name", () => {
    const parser = createParser(`const foo = 4;`);
    const childExpressions: string[] = [];
    parser.getChildExpressions("bar", childExpressions);
    expect(childExpressions).toEqual([]);
  });
});

function createParser(sourceCode: string) {
  const filepath = path.resolve(__dirname, "test.tsx");
  const { project } = createTestSourceFile(sourceCode, filepath);
  return new SourceFileParser(filepath, project);
}
