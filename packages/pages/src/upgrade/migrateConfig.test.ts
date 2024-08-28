import { describe, it, expect } from "vitest";
import { formatServing } from "./migrateConfig.js";

describe("formatServing", () => {
  it("returns expected reverseProxyPrefix", () => {
    const testJson = { displayUrlPrefix: "www.foo.com" };
    const expectedJson = { reverseProxyPrefix: "www.foo.com" };
    expect(formatServing(testJson)).toEqual(expectedJson);
  });

  it("returns nothing when displayUrlPrefix not present", () => {
    const testJson = {};
    expect(formatServing(testJson)).toBeUndefined();
  });
});
