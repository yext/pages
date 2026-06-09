import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  applyReverseProxyOverride,
  buildReverseProxyOverride,
  updateConfigYaml,
  updateViteConfig,
} from "./reverseProxyOverride.js";

describe("parseReverseProxyOverride", () => {
  it("returns the derived override values", () => {
    expect(buildReverseProxyOverride("www.brand.com/locations")).toEqual({
      reverseProxyPrefix: "www.brand.com/locations",
      assetsDir: "locations/assets",
      dynamicRoute: {
        from: "/assets/*",
        to: "/locations/assets/:splat",
        status: 200,
      },
    });
  });

  it("supports nested subpaths", () => {
    expect(buildReverseProxyOverride("www.brand.com/foo/bar")).toEqual({
      reverseProxyPrefix: "www.brand.com/foo/bar",
      assetsDir: "foo/bar/assets",
      dynamicRoute: {
        from: "/assets/*",
        to: "/foo/bar/assets/:splat",
        status: 200,
      },
    });
  });

  it("parses full urls and uses only the normalized path", () => {
    expect(buildReverseProxyOverride("https://www.brand.com/locations/")).toEqual({
      reverseProxyPrefix: "https://www.brand.com/locations/",
      assetsDir: "locations/assets",
      dynamicRoute: {
        from: "/assets/*",
        to: "/locations/assets/:splat",
        status: 200,
      },
    });
  });

  it("collapses duplicate slashes in the subpath", () => {
    expect(buildReverseProxyOverride("www.brand.com/foo//bar/")).toEqual({
      reverseProxyPrefix: "www.brand.com/foo//bar/",
      assetsDir: "foo/bar/assets",
      dynamicRoute: {
        from: "/assets/*",
        to: "/foo/bar/assets/:splat",
        status: 200,
      },
    });
  });

  it("throws when the reverse proxy prefix has no slash", () => {
    expect(() => buildReverseProxyOverride("www.brand.com")).toThrow(/Expected a host and subpath/);
  });

  it("throws when the reverse proxy prefix has an empty subpath", () => {
    expect(() => buildReverseProxyOverride("www.brand.com/")).toThrow(
      /Expected a non-empty subpath/
    );
  });

  it("throws when the normalized subpath contains invalid characters", () => {
    expect(() => buildReverseProxyOverride("www.brand.com/location name")).toThrow(
      /Expected the subpath to contain only letters, numbers, "-", "_", and "\/"/
    );
  });
});

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

      updateConfigYaml(configYamlPath, buildReverseProxyOverride("www.brand.com/locations"));

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

      updateConfigYaml(configYamlPath, buildReverseProxyOverride("www.brand.com/locations"));

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

      updateConfigYaml(configYamlPath, buildReverseProxyOverride("www.brand.com/locations"));

      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("# serving comment");
      expect(fs.readFileSync(configYamlPath, "utf-8")).toContain("# reverse proxy comment");
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

describe("applyReverseProxyOverride", () => {
  const previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
  });

  it("modifies only the scoped files", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
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

      applyReverseProxyOverride("brand", "www.brand.com/locations");

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

  it("fails clearly when a scoped file is missing", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      fs.mkdirSync(path.join(tempDir, "brand"), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, "brand", "config.yaml"),
        "serving:\n  reverseProxyPrefix: scoped\n"
      );
      process.chdir(tempDir);

      expect(() => applyReverseProxyOverride("brand", "www.brand.com/locations")).toThrow(
        /vite\.config\.js does not exist/
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
