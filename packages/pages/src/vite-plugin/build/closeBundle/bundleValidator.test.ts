import { glob } from "glob";
import fs, { Stats } from "fs";
import { validateBundles } from "./bundleValidator.js";

describe("bundleValidator", () => {
  it("throws an error when a single file is over the max filesize limit", async () => {
    jest.spyOn(glob, "sync").mockImplementation(() => ["file1.js", "file2.js"]);
    jest.spyOn(fs, "statSync").mockImplementation((input) => {
      if (input == "file1.js") {
        return getStats(1.6);
      }
      return getStats(0.1);
    });

    expect(() => validateBundles()).toThrowError(
      "Bundled file file1.js exceeds max size of 1.5 MB"
    );

    jest.restoreAllMocks();
  });

  it("throws an error when the total sizes exceed the max limit", async () => {
    jest
      .spyOn(glob, "sync")
      .mockImplementation(() => [
        "file1.js",
        "file2.js",
        "file3.js",
        "file4.js",
        "file5.js",
        "file6.js",
        "file7.js",
      ]);
    jest.spyOn(fs, "statSync").mockImplementation(() => {
      return getStats(1.5);
    });

    expect(() => validateBundles()).toThrowError(
      "The total size of all bundles exceeds the max size of 10 MB"
    );

    jest.restoreAllMocks();
  });

  it("does not throw an error when all individual file sizes and total are under the limits", async () => {
    jest
      .spyOn(glob, "sync")
      .mockImplementation(() => [
        "file1.js",
        "file2.js",
        "file3.js",
        "file4.js",
        "file5.js",
        "file6.js",
        "file7.js",
      ]);
    jest.spyOn(fs, "statSync").mockImplementation(() => {
      return getStats(0.5);
    });

    expect(() => validateBundles()).not.toThrowError();

    jest.restoreAllMocks();
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
