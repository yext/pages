import { describe, it, expect, vi } from "vitest";
import path from "path";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import { minimatch } from "minimatch";

const rootPath = path.join("src", "functions");
const multiLevelPath = path.join("src", "functions", "http", "api", "fetch");

const filepaths = [
  path.join(multiLevelPath, "test1.ts"),
  path.join(multiLevelPath, "test2.js"),
  path.join(rootPath, "test3.js"),
  path.join(rootPath, "test4.ts"),
];

const expected = [
  {
    root: path.resolve("/"),
    dir: path.join(process.cwd(), multiLevelPath),
    base: "test1.ts",
    ext: ".ts",
    name: "test1",
  },
  {
    root: path.resolve("/"),
    dir: path.join(process.cwd(), multiLevelPath),
    base: "test2.js",
    ext: ".js",
    name: "test2",
  },
  {
    root: path.resolve("/"),
    dir: path.join(process.cwd(), rootPath),
    base: "test3.js",
    ext: ".js",
    name: "test3",
  },
  {
    root: path.resolve("/"),
    dir: path.join(process.cwd(), rootPath),
    base: "test4.ts",
    ext: ".ts",
    name: "test4",
  },
];

vi.mock("glob", () => ({
  globSync: (glob: string) => {
    return filepaths.filter((f) => minimatch(path.resolve(f), glob));
  },
}));

describe("getFunctionFilepaths", () => {
  it("collects all function files under the src/functions path", () => {
    const templatesFilepath = getFunctionFilepaths(rootPath);
    expect(JSON.stringify(templatesFilepath.sort())).toEqual(JSON.stringify(expected));
  });
});
