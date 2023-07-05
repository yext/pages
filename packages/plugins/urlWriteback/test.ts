import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { buildApiUrl } from "./yext.ts";

Deno.test("buildApiUrl", () => {
  const url = buildApiUrl("https://www.yext.com", `entities/123`, {
    api_key: "apikey",
    v: "customvparam",
  });

  assertEquals(
    url,
    "https://www.yext.com/entities/123?api_key=apikey&v=customvparam",
  );
});
