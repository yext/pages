import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildReverseProxyOverride,
  parseReverseProxyPrefix,
  ProjectStructure,
} from "../common/src/project/structure.js";
import { applyReverseProxy, updateConfigYaml, updateViteConfig } from "./applyReverseProxy.js";

const buildDefaultReverseProxyOverride = (reverseProxyPrefix: string) =>
  buildReverseProxyOverride("assets", parseReverseProxyPrefix(reverseProxyPrefix));

const writeEsmPackageJson = (directory: string) => {
  fs.writeFileSync(path.join(directory, "package.json"), '{"type":"module"}\n');
};

describe("updateConfigYaml", () => {
  it("overwrites reverse proxy values and preserves unrelated config", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-config-yaml-"));
    const configYamlPath = path.join(tempDir, "config.yaml");

    try {
      fs.writeFileSync(
        configYamlPath,
        `serving:
  reverseProxyPrefix: old.example.com/legacy
  customSetting: true
dynamicRoutes:
  - from: /health
    to: /internal/health
    status: 200
  - from: /assets/*
    to: /legacy/assets/:splat
    status: 302
sitemap:
  filename: sitemap.xml
`
      );

      updateConfigYaml(configYamlPath, buildDefaultReverseProxyOverride("www.brand.com/locations"));

      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain(
        "reverseProxyPrefix: www.brand.com/locations"
      );
      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("to: /locations/assets/:splat");
      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("from: /health");
      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("filename: sitemap.xml");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("adds the reverse proxy route when it is missing", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-config-yaml-"));
    const configYamlPath = path.join(tempDir, "config.yaml");

    try {
      fs.writeFileSync(
        configYamlPath,
        `serving:
  customSetting: true
`
      );

      updateConfigYaml(configYamlPath, buildDefaultReverseProxyOverride("www.brand.com/locations"));

      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("from: /assets/*");
      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain(
        "reverseProxyPrefix: www.brand.com/locations"
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("preserves existing yaml comments when updating the file", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-config-yaml-"));
    const configYamlPath = path.join(tempDir, "config.yaml");

    try {
      fs.writeFileSync(
        configYamlPath,
        `# serving comment
serving:
  # reverse proxy comment
  reverseProxyPrefix: old.example.com/legacy
`
      );

      updateConfigYaml(configYamlPath, buildDefaultReverseProxyOverride("www.brand.com/locations"));

      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("# serving comment");
      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("# reverse proxy comment");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("adds serving and dynamicRoutes when both sections are missing", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-config-yaml-"));
    const configYamlPath = path.join(tempDir, "config.yaml");

    try {
      fs.writeFileSync(
        configYamlPath,
        `buildConfiguration:
  buildCommand: npm run build
`
      );

      updateConfigYaml(configYamlPath, buildDefaultReverseProxyOverride("www.brand.com/locations"));

      const updatedConfigYaml = fs.readFileSync(configYamlPath, "utf-8");
      expect(updatedConfigYaml).toContain("buildCommand: npm run build");
      expect(updatedConfigYaml).toContain("reverseProxyPrefix: www.brand.com/locations");
      expect(updatedConfigYaml).toContain("from: /assets/*");
      expect(updatedConfigYaml).toContain("to: /locations/assets/:splat");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("adds serving and dynamicRoutes to an empty config file", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-config-yaml-"));
    const configYamlPath = path.join(tempDir, "config.yaml");

    try {
      fs.writeFileSync(configYamlPath, "");

      updateConfigYaml(configYamlPath, buildDefaultReverseProxyOverride("www.brand.com/locations"));

      const updatedConfigYaml = fs.readFileSync(configYamlPath, "utf-8");
      expect(updatedConfigYaml).toContain("serving:");
      expect(updatedConfigYaml).toContain("reverseProxyPrefix: www.brand.com/locations");
      expect(updatedConfigYaml).toContain("dynamicRoutes:");
      expect(updatedConfigYaml).toContain("to: /locations/assets/:splat");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("updateViteConfig", () => {
  it("inserts build.assetsDir when build exists without it", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-vite-config-"));
    const viteConfigPath = path.join(tempDir, "vite.config.js");

    try {
      fs.writeFileSync(
        viteConfigPath,
        `import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  build: {},
});
`
      );

      updateViteConfig(viteConfigPath, "locations/assets");

      expect(fs.readFileSync(viteConfigPath, "utf-8")).toContain('assetsDir: "locations/assets"');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("overwrites build.assetsDir when it already exists", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-vite-config-"));
    const viteConfigPath = path.join(tempDir, "vite.config.js");

    try {
      fs.writeFileSync(
        viteConfigPath,
        `export default {
  build: {
    assetsDir: "old/assets"
  }
};
`
      );

      updateViteConfig(viteConfigPath, "locations/assets");

      expect(fs.readFileSync(viteConfigPath, "utf-8")).toContain('assetsDir: "locations/assets"');
      expect(fs.readFileSync(viteConfigPath, "utf-8")).not.toContain("old/assets");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("formats the config after updating assetsDir", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-vite-config-"));
    const viteConfigPath = path.join(tempDir, "vite.config.js");

    try {
      fs.writeFileSync(viteConfigPath, 'export default {build:{assetsDir:"old/assets"}};\n');

      updateViteConfig(viteConfigPath, "locations/assets");

      expect(fs.readFileSync(viteConfigPath, "utf-8")).toBe(
        'export default { build: { assetsDir: "locations/assets" } };\n'
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails clearly when the file cannot be safely updated", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-vite-config-"));
    const viteConfigPath = path.join(tempDir, "vite.config.js");

    try {
      fs.writeFileSync(viteConfigPath, "export default getConfig();\n");

      expect(() => updateViteConfig(viteConfigPath, "locations/assets")).toThrow(
        /Expected export default defineConfig/
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("applyReverseProxy", () => {
  const previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
  });

  it("does nothing when no reverse proxy prefix is provided", async () => {
    await expect(applyReverseProxy(undefined, undefined)).resolves.toBeUndefined();
  });

  it("modifies only the scoped files", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "config.yaml"), "serving:\n  reverseProxyPrefix: root\n");
      fs.writeFileSync(path.join(tempDir, "vite.config.js"), "export default { build: {} };\n");
      fs.writeFileSync(
        path.join(tempDir, "brand", "config.yaml"),
        "serving:\n  reverseProxyPrefix: scoped\n"
      );
      fs.writeFileSync(
        path.join(tempDir, "brand", "vite.config.js"),
        "export default { build: {} };\n"
      );
      process.chdir(tempDir);

      await applyReverseProxy("brand", parseReverseProxyPrefix("www.brand.com/locations"));

      expect(fs.readFileSync(path.join(tempDir, "brand", "config.yaml"), "utf-8")).toContain(
        "reverseProxyPrefix: www.brand.com/locations"
      );
      expect(fs.readFileSync(path.join(tempDir, "brand", "vite.config.js"), "utf-8")).toContain(
        'assetsDir: "locations/assets"'
      );
      expect(fs.readFileSync(path.join(tempDir, "config.yaml"), "utf-8")).toContain(
        "reverseProxyPrefix: root"
      );
      expect(fs.readFileSync(path.join(tempDir, "vite.config.js"), "utf-8")).not.toContain(
        'assetsDir: "locations/assets"'
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("falls back to the root vite config when the scoped file is missing", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "vite.config.js"), "export default { build: {} };\n");
      fs.writeFileSync(
        path.join(tempDir, "brand", "config.yaml"),
        "serving:\n  reverseProxyPrefix: scoped\n"
      );
      process.chdir(tempDir);

      await applyReverseProxy("brand", parseReverseProxyPrefix("www.brand.com/locations"));

      expect(fs.readFileSync(path.join(tempDir, "vite.config.js"), "utf-8")).toContain(
        'assetsDir: "locations/assets"'
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("preserves publicDir and derives the override from the configured assetsDir", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.writeFileSync(path.join(tempDir, "config.yaml"), "{}\n");
      fs.writeFileSync(
        path.join(tempDir, "vite.config.js"),
        `export default {
  publicDir: "custom-public",
  build: {
    assetsDir: "static"
  }
};
`
      );
      process.chdir(tempDir);

      await applyReverseProxy(undefined, parseReverseProxyPrefix("www.brand.com/locations"));
      const projectStructure = await ProjectStructure.init();

      expect(projectStructure.config.subfolders.assets).toBe("locations/static");
      expect(projectStructure.config.subfolders.public).toBe("custom-public");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails clearly when a scoped config yaml is missing", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "vite.config.js"), "export default { build: {} };\n");
      process.chdir(tempDir);

      await expect(
        applyReverseProxy("brand", parseReverseProxyPrefix("www.brand.com/locations"))
      ).rejects.toThrow(/config\.yaml does not exist/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
