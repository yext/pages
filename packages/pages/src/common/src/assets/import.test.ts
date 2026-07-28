import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { import_, versionedFileUrl } from "./import.js";

describe("versionedFileUrl", () => {
  it("returns a new URL when file contents change", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-import-"));
    const modulePath = path.join(tempDir, "config.mjs");

    try {
      fs.writeFileSync(modulePath, 'export default { value: "first" };\n');
      const firstUrl = versionedFileUrl(modulePath);
      expect((await import_(firstUrl)).default.value).toBe("first");

      fs.writeFileSync(modulePath, 'export default { value: "second" };\n');
      const secondUrl = versionedFileUrl(modulePath);
      expect(secondUrl).not.toBe(firstUrl);
      expect((await import_(secondUrl)).default.value).toBe("second");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
