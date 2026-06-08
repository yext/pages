import { afterEach, describe, expect, it } from "vitest";
import { getReverseProxyOverride, REVERSE_PROXY_PREFIX_ENV_VAR } from "./reverseProxyOverride.js";

describe("getReverseProxyOverride", () => {
  afterEach(() => {
    delete process.env[REVERSE_PROXY_PREFIX_ENV_VAR];
  });

  it("returns undefined when the env var is not present", () => {
    expect(getReverseProxyOverride()).toBeUndefined();
  });

  it("returns the derived assetsDir and dynamic route", () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/locations";

    expect(getReverseProxyOverride()).toEqual({
      reverseProxyPrefix: "www.brand.com/locations",
      assetsDir: "locations/assets",
      dynamicRoute: {
        from: "/assets/*",
        to: "/locations/assets/:splat",
        status: 200,
      },
    });
  });

  it("supports nested subpaths", () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/foo/bar";

    expect(getReverseProxyOverride()?.assetsDir).toEqual("foo/bar/assets");
    expect(getReverseProxyOverride()?.dynamicRoute.to).toEqual("/foo/bar/assets/:splat");
  });

  it("throws when the env var does not include a slash", () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com";

    expect(() => getReverseProxyOverride()).toThrow(/Expected a host and subpath/);
  });

  it("throws when the env var has an empty subpath", () => {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = "www.brand.com/";

    expect(() => getReverseProxyOverride()).toThrow(/Expected a non-empty subpath/);
  });
});
