import { describe, it, expect, vi } from "vitest";
import path from "path";
import { getTemplateFilepaths } from "./getTemplateFilepaths.js";
import { minimatch } from "minimatch";
import { Path } from "../../project/path.js";

const rootPath = path.join("src", "templates");
const domain1Path = path.join("src", "templates", "some.domain1.com");
const domain2Path = path.join("src", "templates", "some.domain2.com");
vi.mock("glob", () => ({
  globSync: (glob: string) => {
    const filepaths = [
      path.join(domain1Path, "brand1.tsx"),
      path.join(domain1Path, "test.tsx"),
      path.join(domain2Path, "brand2.tsx"),
      path.join(domain2Path, "test.tsx"),
      path.join(rootPath, "share.tsx"),
      path.join(rootPath, "test.tsx"),
    ];
    return filepaths.filter((f) => minimatch(path.resolve(f), glob));
  },
}));

describe("getTemplateFilepaths", () => {
  it("collects all template files from root folder path", () => {
    const templatesFilepath = getTemplateFilepaths([
      new Path(path.join(process.cwd(), rootPath)),
    ]);
    expect(templatesFilepath.sort()).toEqual(
      [path.join(rootPath, "share.tsx"), path.join(rootPath, "test.tsx")].sort()
    );
  });

  it("collects template files from domain and root folder paths", () => {
    const templatesFilepath = getTemplateFilepaths([
      new Path(path.join(process.cwd(), domain1Path)),
      new Path(path.join(process.cwd(), rootPath)),
    ]);
    expect(templatesFilepath.sort()).toEqual(
      [
        path.join(rootPath, "share.tsx"),
        path.join(domain1Path, "test.tsx"),
        path.join(domain1Path, "brand1.tsx"),
      ].sort()
    );
  });
});
