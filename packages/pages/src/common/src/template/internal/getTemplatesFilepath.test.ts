import path from "path";
import { Path } from "../../project/structure.js";
import { getTemplatesFilepath } from "./getTemplatesFilepath.js";

const domainPath = "src/templates/some.domain.com";
const rootPath = "src/templates";
jest.mock("glob", () => {
  return {
    sync: (path: string) => {
      return path.indexOf(domainPath) != -1
        ? [`${domainPath}/brand.tsx`, `${domainPath}/test.tsx`]
        : [`${rootPath}/share.tsx`, `${rootPath}/test.tsx`];
    },
  };
});
afterAll(() => jest.unmock("glob"));

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
      new Path(path.join(process.cwd(), domainPath))
    );

    expect(templatesFilepath.sort()).toEqual(
      [
        `${rootPath}/share.tsx`,
        `${domainPath}/test.tsx`,
        `${domainPath}/brand.tsx`,
      ].sort()
    );
  });
});
