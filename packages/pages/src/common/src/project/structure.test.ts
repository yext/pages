import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectStructure } from "./structure.js";

describe("ProjectStructure.getViteConfigPath", () => {
  const previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
  });

  it("returns the scoped vite config path when it exists", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-project-structure-"));

    try {
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "brand", "vite.config.js"), "export default {};\n");
      fs.writeFileSync(path.join(tempDir, "vite.config.js"), "export default {};\n");
      process.chdir(tempDir);

      const viteConfigPath = new ProjectStructure({ scope: "brand" }).getViteConfigPath();
      expect(viteConfigPath).toBeDefined();
      expect(fs.realpathSync(viteConfigPath!.getAbsolutePath())).toBe(
        fs.realpathSync(path.join(tempDir, "brand", "vite.config.js"))
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("falls back to the root vite config path when the scoped file is missing", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-project-structure-"));

    try {
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "vite.config.js"), "export default {};\n");
      process.chdir(tempDir);

      const viteConfigPath = new ProjectStructure({ scope: "brand" }).getViteConfigPath();
      expect(viteConfigPath).toBeDefined();
      expect(fs.realpathSync(viteConfigPath!.getAbsolutePath())).toBe(
        fs.realpathSync(path.join(tempDir, "vite.config.js"))
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("returns undefined when neither the scoped nor root vite config exists", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-project-structure-"));

    try {
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      process.chdir(tempDir);

      expect(new ProjectStructure({ scope: "brand" }).getViteConfigPath()).toBeUndefined();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("ProjectStructure.init", () => {
  const previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
  });

  it("uses the reverse proxy assets directory without loading vite.config.js", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-project-structure-"));

    try {
      fs.writeFileSync(
        path.join(tempDir, "vite.config.js"),
        'throw new Error("vite config loaded before reverse proxy override");\nexport default { build: {} };\n'
      );
      fs.writeFileSync(path.join(tempDir, "config.yaml"), "");
      process.chdir(tempDir);

      const projectStructure = await ProjectStructure.init(
        undefined,
        "  www.brand.com/locations  "
      );

      expect(projectStructure.config.reverseProxyOverride).toEqual({
        reverseProxyPrefix: "www.brand.com/locations",
        assetsDir: "locations/assets",
        dynamicRoute: {
          from: "/assets/*",
          to: "/locations/assets/:splat",
          status: 200,
        },
      });
      expect(projectStructure.config.subfolders.assets).toBe("locations/assets");
      expect(fs.readFileSync(path.join(tempDir, "vite.config.js"), "utf-8")).toContain(
        'assetsDir: "locations/assets"'
      );
      expect(new ProjectStructure().config.reverseProxyOverride).toBeUndefined();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
