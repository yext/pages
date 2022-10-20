import path from "path";
import { getTemplatesFilepath } from "./getTemplatesFilepath.js";
import minimatch from "minimatch";
import { Path } from "../../project/path.js";

const rootPath = "src/templates";
const domain1Path = "src/templates/some.domain1.com";
const domain2Path = "src/templates/some.domain2.com";
jest.mock("glob", () => {
  return {
    sync: (glob: string) => {
      const filepaths = [
        `${domain1Path}/brand1.tsx`,
        `${domain1Path}/test.tsx`,
        `${domain2Path}/brand2.tsx`,
        `${domain2Path}/test.tsx`,
        `${rootPath}/share.tsx`,
        `${rootPath}/test.tsx`,
      ];
      return filepaths.filter((f) => minimatch(path.resolve(f), glob));
    },
  };
});

describe("getTemplatesFilepath", () => {
  it("collects all template files from root folder path", () => {
    const templatesFilepath = getTemplatesFilepath(
      new Path(path.join(process.cwd(), rootPath))
    );
    expect(templatesFilepath.sort()).toEqual(
      [`${rootPath}/share.tsx`, `${rootPath}/test.tsx`].sort()
    );
  });

  it("collects template files from domain and root folder paths", () => {
    const templatesFilepath = getTemplatesFilepath(
      new Path(path.join(process.cwd(), rootPath)),
      new Path(path.join(process.cwd(), domain1Path))
    );
    expect(templatesFilepath.sort()).toEqual(
      [
        `${rootPath}/share.tsx`,
        `${domain1Path}/test.tsx`,
        `${domain1Path}/brand1.tsx`,
      ].sort()
    );
  });
});
