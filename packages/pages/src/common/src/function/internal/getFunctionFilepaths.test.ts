import path from "path";
import { getFunctionFilepaths } from "./getFunctionFilepaths.js";
import minimatch from "minimatch";
import { defaultProjectStructureConfig } from "../../project/structure.js";

const rootPath = defaultProjectStructureConfig.filepathsConfig.functionsRoot;
const multiLevelPath =
  defaultProjectStructureConfig.filepathsConfig.functionsRoot +
  "/http/api/fetch";

const filepaths = [
  `${multiLevelPath}/test1.ts`,
  `${multiLevelPath}/test2.js`,
  `${rootPath}/test3.js`,
  `${rootPath}/test4.ts`,
];

const expected = [
  {
    root: "/",
    dir: process.cwd() + "/src/functions/http/api/fetch",
    base: "test1.ts",
    ext: ".ts",
    name: "test1",
  },
  {
    root: "/",
    dir: process.cwd() + "/src/functions/http/api/fetch",
    base: "test2.js",
    ext: ".js",
    name: "test2",
  },
  {
    root: "/",
    dir: process.cwd() + "/src/functions",
    base: "test3.js",
    ext: ".js",
    name: "test3",
  },
  {
    root: "/",
    dir: process.cwd() + "/src/functions",
    base: "test4.ts",
    ext: ".ts",
    name: "test4",
  },
];

jest.mock("glob", () => {
  return {
    sync: (glob: string) => {
      return filepaths.filter((f) => minimatch(path.resolve(f), glob));
    },
  };
});

describe("getFunctionFilepaths", () => {
  it("collects all function files under the src/functions path", () => {
    const templatesFilepath = getFunctionFilepaths("src/functions");
    expect(JSON.stringify(templatesFilepath.sort())).toEqual(
      JSON.stringify(expected)
    );
  });
});
