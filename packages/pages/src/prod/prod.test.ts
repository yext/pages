import { afterEach, describe, expect, it, vi } from "vitest";
import runSubprocess from "../util/runSubprocess.js";
import { prodHandler } from "./prod.js";

vi.mock("../util/runSubprocess.js", () => ({
  default: vi.fn(async () => 0),
}));

describe("prodHandler", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the reverse proxy prefix to the build subprocess", async () => {
    await prodHandler({
      scope: "brand",
      reverseProxyPrefix: "www.brand.com/locations",
    });

    expect(runSubprocess).toHaveBeenNthCalledWith(1, "yext pages", [
      "build",
      "--scope brand",
      "--reverse-proxy-prefix www.brand.com/locations",
    ]);
  });
});
