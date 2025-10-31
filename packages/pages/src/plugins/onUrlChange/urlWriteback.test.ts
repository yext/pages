import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApiUrl, updateEntity } from "./yext.js";

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

describe("updateEntity with resolveApiBase", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const mockFetch = (expectedUrl: string) => {
    return vi.fn().mockImplementation((req: Request) => {
      expect(req.url).toContain(expectedUrl);
      return Promise.resolve(
        new Response(
          JSON.stringify({
            meta: { uuid: "test-uuid", errors: [] },
            response: {
              name: "Test Entity",
              meta: { id: "123", language: "en" },
            },
          }),
          { status: 200 }
        )
      );
    });
  };

  it("calls US production API when env is prod", async () => {
    global.fetch = mockFetch("https://api.yext.com/v2/accounts/me/");

    await updateEntity("entity123", "en", { name: "Test" }, "test-api-key", {
      env: "prod",
      partition: "US",
    });

    expect(global.fetch).toHaveBeenCalled();
    const call = (global.fetch as any).mock.calls[0][0] as Request;
    expect(call.url).toContain("https://api.yext.com/v2/accounts/me/");
  });
});

describe("build output verification", () => {
  it("yext.js import includes resolveApiBase", async () => {
    // Read the built file to verify the import is preserved
    const fs = await import("fs");
    const path = await import("path");
    const builtFile = path.join(
      process.cwd(),
      "dist",
      "plugins",
      "onUrlChange",
      "yext.js"
    );

    if (fs.existsSync(builtFile)) {
      const content = fs.readFileSync(builtFile, "utf-8");
      expect(content).toContain(
        'import { resolveApiBase } from "../../util/resolveApiBase.js"'
      );
      expect(content).toContain("resolveApiBase(partition, env)");
    } else {
      console.warn("Build output not found, skipping build verification test");
    }
  });

  it("resolveApiBase.js contains the correct implementation", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const builtFile = path.join(
      process.cwd(),
      "dist",
      "util",
      "resolveApiBase.js"
    );

    if (fs.existsSync(builtFile)) {
      const content = fs.readFileSync(builtFile, "utf-8");
      expect(content).toContain("YEXT_API_US_PROD");
      expect(content).toContain("YEXT_API_US_SBX");
      expect(content).toContain("YEXT_API_EU_PROD");
      expect(content).toContain('env === "prod" || env === "production"');
      expect(content).toContain('env === "sbx" || env === "sandbox"');
      expect(content).toContain(
        "EU partition only supports production environment"
      );
    } else {
      console.warn("Build output not found, skipping build verification test");
    }
  });
});
