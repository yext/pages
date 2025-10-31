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
