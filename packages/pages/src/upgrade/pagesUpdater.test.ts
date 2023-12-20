import { describe, it, expect } from "vitest";
import { removeFetchImport } from "./pagesUpdater.js";
import path from "path";
import fs from "fs";

const source = path.resolve("src/upgrade/test/src");

function testFetchRemoval(
  fileName: string,
  beforeContent: string,
  expected: string
): boolean {
  const filePath = path.resolve(source, "templates", fileName);
  fs.writeFileSync(filePath, beforeContent);
  removeFetchImport(source);
  const afterContent = fs.readFileSync(filePath, "utf-8");
  fs.rmSync(filePath);
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
