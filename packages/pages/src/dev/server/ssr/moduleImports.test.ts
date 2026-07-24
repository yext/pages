import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ViteDevServer } from "vite";
import { describe, expect, it, vi } from "vitest";
import { importFresh } from "./moduleImports.js";

describe("importFresh", () => {
  it("uses file content as the module cache key", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-module-import-"));
    const modulePath = path.join(tempDir, "module.ts");
    const ssrLoadModule = vi.fn().mockResolvedValue({});
    const devserver = { ssrLoadModule } as unknown as ViteDevServer;

    try {
      fs.writeFileSync(modulePath, "export const value = 1;\n");
      await importFresh(devserver, modulePath);
      await importFresh(devserver, modulePath);

      fs.writeFileSync(modulePath, "export const value = 2;\n");
      await importFresh(devserver, modulePath);

      expect(ssrLoadModule.mock.calls[0][0]).toBe(ssrLoadModule.mock.calls[1][0]);
      expect(ssrLoadModule.mock.calls[2][0]).not.toBe(ssrLoadModule.mock.calls[0][0]);
      expect(ssrLoadModule.mock.calls[0][0]).toMatch(/\?update=[a-f0-9]{64}$/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
