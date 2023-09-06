import path from "path";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import { minimatch } from "minimatch";
import { convertToOSPath } from "../../template/paths.js";

const rootPath = "src/functions";
const multiLevelPath = "src/functions/http/api/fetch";

const filepaths = [
  convertToOSPath(`${multiLevelPath}/test1.ts`),
  convertToOSPath(`${multiLevelPath}/test2.js`),
  convertToOSPath(`${rootPath}/test3.js`),
  convertToOSPath(`${rootPath}/test4.ts`),
];

const expected = [
  {
    root: path.resolve("/"),
    dir: convertToOSPath(process.cwd() + "/src/functions/http/api/fetch"),
    base: "test1.ts",
    ext: ".ts",
    name: "test1",
  },
  {
    root: path.resolve("/"),
    dir: convertToOSPath(process.cwd() + "/src/functions/http/api/fetch"),
    base: "test2.js",
    ext: ".js",
    name: "test2",
  },
  {
    root: path.resolve("/"),
    dir: convertToOSPath(process.cwd() + "/src/functions"),
    base: "test3.js",
    ext: ".js",
    name: "test3",
  },
  {
    root: path.resolve("/"),
    dir: convertToOSPath(process.cwd() + "/src/functions"),
    base: "test4.ts",
    ext: ".ts",
    name: "test4",
  },
];

jest.mock("glob", () => {
  return {
    globSync: (glob: string) => {
      return filepaths.filter((f) => minimatch(path.resolve(f), glob));
    },
  };
});

describe("getFunctionFilepaths", () => {
  it("collects all function files under the src/functions path", () => {
    const templatesFilepath = getFunctionFilepaths(
      convertToOSPath("src/functions")
    );
    expect(JSON.stringify(templatesFilepath.sort())).toEqual(
      JSON.stringify(expected)
    );
  });
});
