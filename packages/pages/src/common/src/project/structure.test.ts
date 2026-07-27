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

  it("uses the default paths when no vite config exists", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-project-structure-"));

    try {
      process.chdir(tempDir);

      const projectStructure = await ProjectStructure.init();

      expect(projectStructure.config.subfolders.assets).toBe("assets");
      expect(projectStructure.config.subfolders.public).toBe("public");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("preserves configured paths when no vite config exists", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-project-structure-"));

    try {
      process.chdir(tempDir);

      const projectStructure = await ProjectStructure.init({
        subfolders: {
          assets: "custom-assets",
          public: "custom-public",
        },
      });

      expect(projectStructure.config.subfolders.assets).toBe("custom-assets");
      expect(projectStructure.config.subfolders.public).toBe("custom-public");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
