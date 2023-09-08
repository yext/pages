import {
  convertToPosixPath,
  getRelativePrefixToRootFromPath,
} from "../../src/template/paths.js";
import path from "node:path";

describe("getRelativePrefixToRootFromPath", () => {
  const relativePosixPath = "spaghetti/meatballs";
  const relativeOSPath = `spaghetti${path.sep}meatballs`;
  const absolutePosixPath = "/enchilada/burrito/taco";
  const absoluteOSPath = `${path.sep}enchilada${path.sep}burrito${path.sep}taco`;

  it("properly returns the empty string when on root level", async () => {
    const path = "foobar.txt";

    const expectedRelativePathPrefix = "";

    expect(getRelativePrefixToRootFromPath(path)).toEqual(
      expectedRelativePathPrefix
    );
  });

  it("properly returns the relative directory prefix when deeper than root level", async () => {
    const p = "foo/bar/foo/foobar.txt";

    const expectedRelativePathPrefix = "../../../";

    expect(getRelativePrefixToRootFromPath(p)).toEqual(
      expectedRelativePathPrefix
    );
  });

  it("convert to posix path", async () => {
    expect(convertToPosixPath(relativePosixPath)).toEqual(relativePosixPath);
    expect(convertToPosixPath(relativeOSPath)).toEqual(relativePosixPath);
    expect(convertToPosixPath(absolutePosixPath)).toEqual(absolutePosixPath);
    expect(convertToPosixPath(absoluteOSPath)).toEqual(absolutePosixPath);
  });
});
