/**
 * @jest-environment jsdom
 */
import { isProduction } from "./env.js";
import * as runTime from "./runtime.js";

describe("isProduction", () => {
  it("returns true when browser and prod domain", async () => {
    const runtimeSpy = jest.spyOn(runTime, "getRuntime") as jest.MockInstance<
      any,
      any
    >;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const domain = "prod.com";

    const windowSpy = jest.spyOn(window, "window", "get") as jest.MockInstance<
      any,
      any
    >;
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
    const runtimeSpy = jest.spyOn(runTime, "getRuntime") as jest.MockInstance<
      any,
      any
    >;
    runtimeSpy.mockImplementation(() => ({
      name: "node",
    }));

    const domain = "prod.com";

    const windowSpy = jest.spyOn(window, "window", "get") as jest.MockInstance<
      any,
      any
    >;
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
    const runtimeSpy = jest.spyOn(runTime, "getRuntime") as jest.MockInstance<
      any,
      any
    >;
    runtimeSpy.mockImplementation(() => ({
      name: "browser",
    }));

    const windowSpy = jest.spyOn(window, "window", "get") as jest.MockInstance<
      any,
      any
    >;
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
