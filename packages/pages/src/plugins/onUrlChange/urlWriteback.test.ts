import { describe, it, expect } from "vitest";
import { buildApiUrl } from "./yext.js";

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
