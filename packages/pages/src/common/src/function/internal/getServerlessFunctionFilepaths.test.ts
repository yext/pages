import path from "path";
import { getServerlessFunctionFilepaths } from "./getServerlessFunctionFilepaths.js";
import minimatch from "minimatch";
import { Path } from "../../project/path.js";

const rootPath = "src/functions";
const multiLevelPath = "src/functions/http/api/fetch";

const filepaths = [
  `${multiLevelPath}/test1.ts`,
  `${multiLevelPath}/test2.js`,
  `${rootPath}/test3.js`,
  `${rootPath}/test4.ts`,
];

jest.mock("glob", () => {
  return {
    sync: (glob: string) => {
      return filepaths.filter((f) => minimatch(path.resolve(f), glob));
    },
  };
});

describe("getServerlessFunctionFilepaths", () => {
  it("collects all function files under the root folder path", () => {
    const templatesFilepath = getServerlessFunctionFilepaths([
      new Path(path.join(process.cwd(), rootPath)),
    ]);
    expect(templatesFilepath.sort()).toEqual(filepaths.sort());
  });
});
