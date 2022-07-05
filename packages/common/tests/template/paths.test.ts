import { getRelativePrefixToRootFromPath } from "../../src/template/paths";

describe("getRelativePrefixToRootFromPath", () => {
  it("properly returns the empty string when on root level", async () => {
    const path = "foobar.txt";

    const expectedRelativePathPrefix = "";

    expect(getRelativePrefixToRootFromPath(path)).toEqual(
      expectedRelativePathPrefix
    );
  });

  it("properly returns the relative directory prefix when deeper than root level", async () => {
    const path = "foo/bar/foo/foobar.txt";

    const expectedRelativePathPrefix = "../../../";

    expect(getRelativePrefixToRootFromPath(path)).toEqual(
      expectedRelativePathPrefix
    );
  });
});
