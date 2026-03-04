import { describe, expect, it } from "vitest";
import { sanitizeSubpath } from "./sanitizeSubpath.js";

describe("sanitizeSubpath", () => {
  it("returns normalized relative path when already safe", () => {
    expect(sanitizeSubpath("assets/static", "assets")).toEqual("assets/static");
  });

  it("sanitizes absolute unix paths to relative subpaths", () => {
    expect(sanitizeSubpath("/my/subpath/assets", "assets")).toEqual("my/subpath/assets");
  });

  it("sanitizes absolute windows paths to relative subpaths", () => {
    expect(sanitizeSubpath("C:\\my\\subpath\\assets", "assets")).toEqual("my/subpath/assets");
  });

  it("falls back when value is empty", () => {
    expect(sanitizeSubpath("   ", "assets")).toEqual("assets");
  });

  it("falls back when value escapes output directory", () => {
    expect(sanitizeSubpath("../escape", "assets")).toEqual("assets");
  });

  it("falls back when normalized value resolves to current directory", () => {
    expect(sanitizeSubpath("./", "assets")).toEqual("assets");
  });

  it("normalizes nested relative segments", () => {
    expect(sanitizeSubpath("assets/../assets/static", "assets")).toEqual("assets/static");
  });

  it("throws when fallback is unsafe", () => {
    expect(() => sanitizeSubpath("assets", "../unsafe")).toThrowError(
      "Invalid sanitizeSubpath fallback"
    );
  });
});
