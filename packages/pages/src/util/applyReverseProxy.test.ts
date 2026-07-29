import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";
import { ProjectStructure } from "../common/src/project/structure.js";
import {
  applyReverseProxy,
  buildReverseProxyOverride,
  parseReverseProxyPrefix,
  updateConfigYaml,
  updateViteConfig,
} from "./applyReverseProxy.js";

const buildDefaultReverseProxyOverride = (reverseProxyPrefix: string) =>
  buildReverseProxyOverride("assets", parseReverseProxyPrefix(reverseProxyPrefix)!);

const writeEsmPackageJson = (directory: string) => {
  fs.writeFileSync(path.join(directory, "package.json"), '{"type":"module"}\n');
};

describe("parseReverseProxyPrefix", () => {
  it.each([
    {
      name: "undefined",
      reverseProxyPrefix: undefined,
    },
    {
      name: "empty",
      reverseProxyPrefix: "",
    },
    {
      name: "whitespace-only",
      reverseProxyPrefix: "   ",
    },
  ])("returns undefined when the prefix is $name", ({ reverseProxyPrefix }) => {
    expect(parseReverseProxyPrefix(reverseProxyPrefix)).toBeUndefined();
  });

  it("trims the prefix and normalizes the subpath", () => {
    expect(parseReverseProxyPrefix("  www.brand.com/foo//bar/  ")).toEqual({
      reverseProxyPrefix: "www.brand.com/foo//bar/",
      subpath: "foo/bar",
    });
  });

  it("decodes percent-encoded path segments", () => {
    expect(parseReverseProxyPrefix("www.brand.com/%6Cocations")).toEqual({
      reverseProxyPrefix: "www.brand.com/%6Cocations",
      subpath: "locations",
    });
  });

  it.each([
    {
      name: "a protocol",
      reverseProxyPrefix: "https://www.brand.com/locations",
      expectedError: /Do not include a protocol/,
    },
    {
      name: "no subpath separator",
      reverseProxyPrefix: "www.brand.com",
      expectedError: /Expected a host and subpath/,
    },
    {
      name: "no host",
      reverseProxyPrefix: "/locations",
      expectedError: /Expected a host and subpath/,
    },
    {
      name: "an empty subpath",
      reverseProxyPrefix: "www.brand.com/",
      expectedError: /Expected a non-empty subpath/,
    },
    {
      name: "invalid percent-encoding",
      reverseProxyPrefix: "www.brand.com/%ZZ",
      expectedError: /Expected valid percent-encoding/,
    },
    {
      name: "invalid subpath characters",
      reverseProxyPrefix: "www.brand.com/location name",
      expectedError: /Expected the subpath to contain only/,
    },
  ])("rejects a prefix with $name", ({ reverseProxyPrefix, expectedError }) => {
    expect(() => parseReverseProxyPrefix(reverseProxyPrefix)).toThrow(expectedError);
  });
});

describe("buildReverseProxyOverride", () => {
  it("returns the derived override values", () => {
    expect(
      buildReverseProxyOverride("assets", parseReverseProxyPrefix("www.brand.com/locations")!)
    ).toEqual({
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
    expect(
      buildReverseProxyOverride("assets", parseReverseProxyPrefix("www.brand.com/foo/bar")!)
    ).toEqual({
      reverseProxyPrefix: "www.brand.com/foo/bar",
      assetsDir: "foo/bar/assets",
      dynamicRoute: {
        from: "/assets/*",
        to: "/foo/bar/assets/:splat",
        status: 200,
      },
    });
  });

  it("uses the provided assets path", () => {
    expect(
      buildReverseProxyOverride("static", parseReverseProxyPrefix("www.brand.com/locations")!)
    ).toEqual({
      reverseProxyPrefix: "www.brand.com/locations",
      assetsDir: "locations/static",
      dynamicRoute: {
        from: "/static/*",
        to: "/locations/static/:splat",
        status: 200,
      },
    });
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

  it("initializes config-side plugins after assetsDir is prefixed", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.writeFileSync(path.join(tempDir, "config.yaml"), "{}\n");
      fs.writeFileSync(
        path.join(tempDir, "plugin.js"),
        `import fs from "node:fs";

export const plugin = () => {
  const viteConfig = fs.readFileSync(new URL("./vite.config.js", import.meta.url), "utf-8");
  if (!viteConfig.includes('assetsDir: "locations/assets"')) {
    throw new Error("plugin initialized before reverse proxy override");
  }
  return {};
};
`
      );
      fs.writeFileSync(
        path.join(tempDir, "vite.config.js"),
        `import { plugin } from "./plugin.js";

export default {
  plugins: [plugin()],
  build: {
    assetsDir: "assets"
  }
};
`
      );
      process.chdir(tempDir);

      await applyReverseProxy(undefined, parseReverseProxyPrefix("www.brand.com/locations"));
      const projectStructure = await ProjectStructure.init();

      expect(projectStructure.config.subfolders.assets).toBe("locations/assets");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not duplicate the assets prefix or route on repeated runs", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.writeFileSync(path.join(tempDir, "config.yaml"), "{}\n");
      fs.writeFileSync(
        path.join(tempDir, "vite.config.js"),
        'export default { build: { assetsDir: "static" } };\n'
      );
      process.chdir(tempDir);

      const parsedReverseProxyPrefix = parseReverseProxyPrefix("www.brand.com/locations");
      await applyReverseProxy(undefined, parsedReverseProxyPrefix);
      await applyReverseProxy(undefined, parsedReverseProxyPrefix);

      expect(fs.readFileSync(path.join(tempDir, "vite.config.js"), "utf-8")).toContain(
        'assetsDir: "locations/static"'
      );
      const configYaml = YAML.parse(fs.readFileSync(path.join(tempDir, "config.yaml"), "utf-8"));
      expect(configYaml.dynamicRoutes).toEqual([
        {
          from: "/static/*",
          to: "/locations/static/:splat",
          status: 200,
        },
      ]);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("replaces the existing assets prefix when the reverse proxy prefix changes", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-build-override-"));

    try {
      writeEsmPackageJson(tempDir);
      fs.writeFileSync(path.join(tempDir, "config.yaml"), "{}\n");
      fs.writeFileSync(
        path.join(tempDir, "vite.config.js"),
        'export default { build: { assetsDir: "static" } };\n'
      );
      process.chdir(tempDir);

      await applyReverseProxy(undefined, parseReverseProxyPrefix("www.brand.com/locations"));
      await applyReverseProxy(undefined, parseReverseProxyPrefix("www.brand.com/stores"));

      expect(fs.readFileSync(path.join(tempDir, "vite.config.js"), "utf-8")).toContain(
        'assetsDir: "stores/static"'
      );
      const configYaml = YAML.parse(fs.readFileSync(path.join(tempDir, "config.yaml"), "utf-8"));
      expect(configYaml).toMatchObject({
        serving: {
          reverseProxyPrefix: "www.brand.com/stores",
        },
        dynamicRoutes: [
          {
            from: "/static/*",
            to: "/stores/static/:splat",
            status: 200,
          },
        ],
      });
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
