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
        hostname: "staging.com",
      },
    }));

    expect(isProduction("prod.com")).toBeFalsy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns false when browser and staging domain and multiple allowed prod domains", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "staging.com",
      },
    }));

    expect(isProduction("prod1.com", "prod2.com")).toBeFalsy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns true when browser and prod domain and multiple allowed prod domains", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "prod1.com",
      },
    }));

    expect(isProduction("prod1.com", "prod2.com")).toBeTruthy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns true when browser and prod domain and no prod domains specified", async () => {
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

    expect(isProduction()).toBeTruthy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns false when browser and localhost and no prod domains specified", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "localhost",
      },
    }));

    expect(isProduction()).toBeFalsy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });

  it("returns false when browser and preview domain and no prod domains specified", async () => {
    const runtimeSpy = vi.spyOn(runTime, "getRuntime") as unknown as any;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const windowSpy = vi.spyOn(window, "window", "get") as unknown as any;
    windowSpy.mockImplementation(() => ({
      location: {
        hostname: "test.preview.pagescdn.com",
      },
    }));

    expect(isProduction()).toBeFalsy();

    windowSpy.mockRestore();
    runtimeSpy.mockRestore();
  });
});
