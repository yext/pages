import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildReverseProxyOverride,
  parseReverseProxyPrefix,
  ProjectStructure,
} from "./structure.js";

describe("parseReverseProxyPrefix", () => {
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
      name: "an empty value",
      reverseProxyPrefix: "",
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
      buildReverseProxyOverride("assets", parseReverseProxyPrefix("www.brand.com/locations"))
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
      buildReverseProxyOverride("assets", parseReverseProxyPrefix("www.brand.com/foo/bar"))
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
      buildReverseProxyOverride("static", parseReverseProxyPrefix("www.brand.com/locations"))
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
});
