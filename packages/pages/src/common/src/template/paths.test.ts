import {
  convertToPosixPath,
  getRelativePrefixToRootFromPath,
} from "../../src/template/paths.js";
import path from "node:path";

describe("getRelativePrefixToRootFromPath", () => {
  const relativePath = "spaghetti/meatballs";
  const relativeWinPath = "spaghetti\\meatballs";
  const absolutePath = "/enchilada/burrito/taco";
  const absoluteWinPath = "\\enchilada\\burrito\\taco";

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
    expect(convertToPosixPath(relativePath)).toEqual(relativePath);
    expect(convertToPosixPath(relativeWinPath)).toEqual(relativePath);
    expect(convertToPosixPath(absolutePath)).toEqual(absolutePath);
    expect(convertToPosixPath(absoluteWinPath)).toEqual(absolutePath);
  });
});
