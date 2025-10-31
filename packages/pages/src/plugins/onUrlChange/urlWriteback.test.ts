import { describe, it, expect } from "vitest";
import { buildApiUrl } from "./yext.js";
import { resolveApiBase } from "../../util/resolveApiBase.js";

describe("buildApiUrl", () => {
  it("returns a correctly built url", async () => {
    const url = buildApiUrl("https://www.yext.com", `entities/123`, {
      api_key: "apikey",
      v: "customvparam",
    });
    expect(url).toEqual(
      "https://www.yext.com/entities/123?api_key=apikey&v=customvparam"
    );
  });
});

describe("resolveApiBase integration", () => {
  it("resolves US production URL", () => {
    const url = resolveApiBase("US", "production");
    expect(url).toBe("https://api.yext.com/v2/accounts/me/");
  });

  it("resolves US sandbox URL", () => {
    const url = resolveApiBase("US", "sandbox");
    expect(url).toBe("https://api-sandbox.yext.com/v2/accounts/me/");
  });

  it("resolves EU production URL", () => {
    const url = resolveApiBase("EU", "production");
    expect(url).toBe("https://api.eu.yext.com/v2/accounts/me/");
  });

  it("throws error for EU sandbox", () => {
    expect(() => resolveApiBase("EU", "sandbox")).toThrow(
      "EU partition only supports production environment"
    );
  });
});
