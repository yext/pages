import { describe, it, expect, vi } from "vitest";
import { formatServing, formatSiteStream } from "./migrateConfig.js";

const siteStreamPath = "foo/bar";

describe("formatSiteStream", () => {
  it("errors and exits when there are multiple entityIds", () => {
    const testJson = { filter: { entityIds: ["1234", "123"] } };
    const mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    formatSiteStream(testJson, siteStreamPath);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("returns expected entityId", () => {
    const testJson = { filter: { entityIds: ["1234"] } };
    const expectedJson = { entityId: "1234" };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });

  it("returns expected reverseProxyPrefix", () => {
    const testJson = { reverseProxy: { displayUrlPrefix: "foo" } };
    const expectedJson = { serving: { reverseProxyPrefix: "foo" } };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });

  it("returns expected id with id first", () => {
    const testJson = { fields: ["meta", "name"], $id: "123" };
    const expectedJson = { id: "123", fields: ["meta", "name"] };
    expect(formatSiteStream(testJson, siteStreamPath)).toEqual(expectedJson);
  });
});

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
