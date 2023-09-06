import path from "path";
import { getTemplateFilepaths } from "./getTemplateFilepaths.js";
import { minimatch } from "minimatch";
import { Path } from "../../project/path.js";
import { convertToOSPath } from "../paths.js";

const rootPath = "src/templates";
const domain1Path = "src/templates/some.domain1.com";
const domain2Path = "src/templates/some.domain2.com";
jest.mock("glob", () => {
  return {
    globSync: (glob: string) => {
      const filepaths = [
        convertToOSPath(`${domain1Path}/brand1.tsx`),
        convertToOSPath(`${domain1Path}/test.tsx`),
        convertToOSPath(`${domain2Path}/brand2.tsx`),
        convertToOSPath(`${domain2Path}/test.tsx`),
        convertToOSPath(`${rootPath}/share.tsx`),
        convertToOSPath(`${rootPath}/test.tsx`),
      ];
      return filepaths.filter((f) => minimatch(path.resolve(f), glob));
    },
  };
});

describe("getTemplateFilepaths", () => {
  it("collects all template files from root folder path", () => {
    const templatesFilepath = getTemplateFilepaths([
      new Path(convertToOSPath(path.join(process.cwd(), rootPath))),
    ]);
    expect(templatesFilepath.sort()).toEqual(
      [
        convertToOSPath(`${rootPath}/share.tsx`),
        convertToOSPath(`${rootPath}/test.tsx`),
      ].sort()
    );
  });

  it("collects template files from domain and root folder paths", () => {
    const templatesFilepath = getTemplateFilepaths([
      new Path(path.join(process.cwd(), domain1Path)),
      new Path(path.join(process.cwd(), rootPath)),
    ]);
    expect(templatesFilepath.sort()).toEqual(
      [
        convertToOSPath(`${rootPath}/share.tsx`),
        convertToOSPath(`${domain1Path}/test.tsx`),
        convertToOSPath(`${domain1Path}/brand1.tsx`),
      ].sort()
    );
  });
});
