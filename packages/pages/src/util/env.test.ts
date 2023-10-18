// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { isProduction } from "./env.js";
import * as runTime from "./runtime.js";

describe("isProduction", () => {
  it("returns true when browser and prod domain", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const domain = "prod.com";

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "prod.com",
      },
    }));

    expect(isProduction(domain)).toBeTruthy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns false when not browser and prod domain", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "node",
    }));

    const domain = "prod.com";

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "prod.com",
      },
    }));

    expect(isProduction(domain)).toBeFalsy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns false when browser and staging domain", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "prod.com",
      },
    }));

    expect(isProduction("staging.com")).toBeFalsy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });
});
