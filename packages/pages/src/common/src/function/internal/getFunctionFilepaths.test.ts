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
    absolute: "src/functions/http/api/fetch/test1.ts",
    relative: "http/api/fetch/test1",
    extension: "ts",
    filename: "test1",
  },
  {
    absolute: "src/functions/http/api/fetch/test2.js",
    relative: "http/api/fetch/test2",
    extension: "js",
    filename: "test2",
  },
  {
    absolute: "src/functions/test3.js",
    relative: "test3",
    extension: "js",
    filename: "test3",
  },
  {
    absolute: "src/functions/test4.ts",
    relative: "test4",
    extension: "ts",
    filename: "test4",
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
