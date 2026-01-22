import { describe, it, expect, vi } from "vitest";
import { Stats } from "fs";
import { validateBundles } from "./bundleValidator.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";

const PLUGIN_FILESIZE_LIMIT = 10; // MB
const PLUGIN_TOTAL_FILESIZE_LIMIT = 10; // MB

describe("bundleValidator", () => {
  const projectStructure = new ProjectStructure();

  it("throws an error when a single file is over the max filesize limit", async () => {
    const bundleValidatorHelper = await import("./bundleValidatorHelper.js");

    vi.spyOn(bundleValidatorHelper, "getBundlePaths").mockImplementation(() => [
      "file1.js",
      "file2.js",
    ]);

    vi.spyOn(bundleValidatorHelper, "statSync").mockImplementation((input) => {
      if (input == "file1.js") {
        return getStats(10.1);
      }
      return getStats(0.1);
    });

    expect(() =>
      validateBundles(projectStructure, PLUGIN_FILESIZE_LIMIT, PLUGIN_TOTAL_FILESIZE_LIMIT)
    ).toThrowError("Bundled file file1.js exceeds max size of 10 MB");
  });

  it("throws an error when the total sizes exceed the max limit", async () => {
    const bundleValidatorHelper = await import("./bundleValidatorHelper.js");

    vi.spyOn(bundleValidatorHelper, "getBundlePaths").mockImplementation(() => [
      "file1.js",
      "file2.js",
      "file3.js",
      "file4.js",
      "file5.js",
      "file6.js",
      "file7.js",
    ]);

    vi.spyOn(bundleValidatorHelper, "statSync").mockImplementation(() => getStats(1.5));

    expect(() =>
      validateBundles(projectStructure, PLUGIN_FILESIZE_LIMIT, PLUGIN_TOTAL_FILESIZE_LIMIT)
    ).toThrowError("The total size of all bundles exceeds the max size of 10 MB");
  });

  it("does not throw an error when all individual file sizes and total are under the limits", async () => {
    const bundleValidatorHelper = await import("./bundleValidatorHelper.js");

    vi.spyOn(bundleValidatorHelper, "getBundlePaths").mockImplementation(() => [
      "file1.js",
      "file2.js",
      "file3.js",
      "file4.js",
      "file5.js",
      "file6.js",
      "file7.js",
    ]);
    vi.spyOn(bundleValidatorHelper, "statSync").mockImplementation(() => getStats(0.5));

    expect(() =>
      validateBundles(projectStructure, PLUGIN_FILESIZE_LIMIT, PLUGIN_TOTAL_FILESIZE_LIMIT)
    ).not.toThrowError();
  });
});

// Returns a Stats object. The only thing that matters for these tests is the size.
const getStats = (filesizeInMB: number): Stats => {
  return {
    dev: 2114,
    ino: 48064969,
    mode: 33188,
    nlink: 1,
    uid: 85,
    gid: 100,
    rdev: 0,
    size: filesizeInMB * 1024 * 1024,
    blksize: 4096,
    blocks: 8,
    atimeMs: 1318289051000.1,
    mtimeMs: 1318289051000.1,
    ctimeMs: 1318289051000.1,
    birthtimeMs: 1318289051000.1,
    atime: new Date(),
    mtime: new Date(),
    ctime: new Date(),
    birthtime: new Date(),
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isDirectory: () => false,
    isFile: () => true,
    isFIFO: () => false,
    isSocket: () => false,
    isSymbolicLink: () => false,
  };
};
