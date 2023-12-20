import { describe, it, expect } from "vitest";
import { removeFetchImport } from "./pagesUpdater.js";
import path from "path";
import fs from "fs";

function testFetchRemoval(
  fileName: string,
  beforeContent: string,
  expected: string
): boolean {
  const testFolder = path.resolve("src/upgrade/test");
  const source = path.resolve(testFolder, "src");
  const templates = path.resolve(source, "templates");
  fs.mkdirSync(templates, {
    recursive: true,
  });
  const filePath = path.resolve(templates, fileName);
  fs.writeFileSync(filePath, beforeContent);
  removeFetchImport(source);
  const afterContent = fs.readFileSync(filePath, "utf-8");
  fs.rmSync(testFolder, { recursive: true });
  return afterContent === expected;
}

describe("test pages updater steps", () => {
  it("removes fetch import", () => {
    const beforeContent = 'import { fetch } from "@yext/pages/util";';
    expect(testFetchRemoval("location.tsx", beforeContent, "")).toEqual(true);
  });
  it("removes fetch import multi-line", () => {
    const beforeContent =
      "import {\n" +
      "  fetch,\n" +
      "  tacos,\n" +
      "  burritos,\n" +
      "  quesadillas,\n" +
      "  chimichangas,\n" +
      '} from "@yext/pages/util";';
    const expected =
      "import {\n" +
      "  tacos,\n" +
      "  burritos,\n" +
      "  quesadillas,\n" +
      "  chimichangas,\n" +
      '} from "@yext/pages/util";';
    expect(testFetchRemoval("multiLine.tsx", beforeContent, expected)).toEqual(
      true
    );
  });
  it("does not remove fetch import from other sources", () => {
    const beforeContent = 'import { fetch } from "@yext/papers/utilities";';
    expect(testFetchRemoval("other.tsx", beforeContent, beforeContent)).toEqual(
      true
    );
  });
});
