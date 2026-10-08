import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { build, Plugin } from "vite";
import { ProjectStructure } from "../common/src/project/structure.js";
import { generateClientTemplate, getClientTemplateId } from "../common/src/template/client.js";
import { discoverInputs } from "./build/buildStart/buildStart.js";
import { clientHydration } from "./clientHydration.js";

describe("virtual client hydration", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const tempDir of tempDirs.splice(0)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const createProject = (scope?: string) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-client-hydration-"));
    tempDirs.push(tempDir);
    const project = new ProjectStructure({ rootFolders: { source: tempDir }, scope });
    fs.mkdirSync(path.join(tempDir, "templates"));
    return { tempDir, project, templatesDir: path.join(tempDir, "templates") };
  };

  it.each(["tsx", "jsx", "ts", "js"])(
    "bundles a virtual %s client with relative imports and preserves the source directory",
    async (extension) => {
      const { tempDir, templatesDir } = createProject();
      const templatePath = path.join(templatesDir, `page.${extension}`);
      const clientPath = path.join(templatesDir, `page.client.${extension}`);
      fs.mkdirSync(path.join(tempDir, "components"));
      fs.writeFileSync(
        path.join(tempDir, "components", "format.ts"),
        'export const format = (value: string) => "relative-dependency:" + value;'
      );
      fs.writeFileSync(path.join(tempDir, "style.css"), ".virtual-marker { color: red; }");
      fs.writeFileSync(
        path.join(tempDir, "image.svg"),
        '<svg xmlns="http://www.w3.org/2000/svg"/>'
      );
      const usesJsx = extension.endsWith("x");
      fs.writeFileSync(
        templatePath,
        `import { format } from "../components/format";
         import "../style.css";
         import image from "../image.svg";
         import { serverOnly } from "./missing-server-only";
         export const transformProps = () => serverOnly();
         const value = "client-value";
         const Page = () => ${usesJsx ? '<img src={image} alt={format(value)} className="virtual-marker" />' : "format(value) + image"};
         export default Page;`
      );
      fs.writeFileSync(clientPath, "existing client file must remain untouched");
      const originalFiles = fs.readdirSync(templatesDir).sort();
      let watchedFiles: string[] = [];
      const inspectBuild: Plugin = {
        name: "inspect-client-build",
        buildEnd() {
          watchedFiles = this.getWatchFiles();
          expect(fs.readdirSync(templatesDir).sort()).toEqual(originalFiles);
        },
      };

      const clientSource = generateClientTemplate(templatePath);
      expect(clientSource).toContain("const value");
      expect(clientSource).toContain("format");
      expect(clientSource).not.toContain("transformProps");
      expect(clientSource).not.toContain("serverOnly");

      const result = await build({
        configFile: false,
        root: tempDir,
        logLevel: "silent",
        publicDir: false,
        plugins: [clientHydration(), inspectBuild],
        esbuild: { jsx: "automatic", jsxDev: false },
        build: {
          outDir: path.join(tempDir, "dist"),
          manifest: true,
          assetsInlineLimit: 0,
          minify: false,
          rollupOptions: {
            input: { "client/page": getClientTemplateId(templatePath) },
            external: ["react/jsx-runtime"],
            preserveEntrySignatures: "strict",
          },
        },
      });
      if (Array.isArray(result) || !("output" in result)) {
        throw new Error("Expected a single build output");
      }
      const entry = result.output.find((output) => output.type === "chunk" && output.isEntry);
      expect(entry?.name).toBe("client/page");
      if (entry?.type !== "chunk") {
        throw new Error("Expected a client entry chunk");
      }
      expect(entry.exports).toContain("default");
      expect(entry.code).toContain("relative-dependency:");
      expect(entry.code).not.toContain("serverOnly");
      expect(result.output.some((output) => output.fileName.endsWith(".css"))).toBe(true);
      expect(result.output.some((output) => output.fileName.endsWith(".svg"))).toBe(true);
      const manifest = JSON.parse(
        fs.readFileSync(path.join(tempDir, "dist", ".vite", "manifest.json"), "utf8")
      );
      expect(Object.values(manifest)).toContainEqual(
        expect.objectContaining({ name: "client/page", isEntry: true, file: entry.fileName })
      );
      expect(watchedFiles).toContain(templatePath.replaceAll(path.sep, "/"));
      expect(fs.readdirSync(templatesDir).sort()).toEqual(originalFiles);
      expect(fs.readFileSync(clientPath, "utf8")).toBe(
        "existing client file must remain untouched"
      );
    }
  );

  it("keeps templates without default exports as empty client modules", async () => {
    const { tempDir, templatesDir } = createProject();
    const templatePath = path.join(templatesDir, "robots.ts");
    fs.writeFileSync(templatePath, 'export const render = () => "robots";');
    expect(generateClientTemplate(templatePath)).toBe("");
    await build({
      configFile: false,
      root: tempDir,
      logLevel: "silent",
      plugins: [clientHydration()],
      build: { write: false, rollupOptions: { input: getClientTemplateId(templatePath) } },
    });
    expect(fs.readdirSync(templatesDir)).toEqual(["robots.ts"]);
  });

  it("leaves source files untouched when a client build fails", async () => {
    const { tempDir, templatesDir } = createProject();
    const templatePath = path.join(templatesDir, "page.tsx");
    const source =
      'import missing from "./missing"; const Page = () => missing(); export default Page;';
    fs.writeFileSync(templatePath, source);
    fs.writeFileSync(path.join(templatesDir, "page.client.tsx"), "existing client");
    await expect(
      build({
        configFile: false,
        root: tempDir,
        logLevel: "silent",
        plugins: [clientHydration()],
        build: { write: false, rollupOptions: { input: getClientTemplateId(templatePath) } },
      })
    ).rejects.toThrow(/Could not resolve/);
    expect(fs.readdirSync(templatesDir).sort()).toEqual(["page.client.tsx", "page.tsx"]);
    expect(fs.readFileSync(templatePath, "utf8")).toBe(source);
    expect(fs.readFileSync(path.join(templatesDir, "page.client.tsx"), "utf8")).toBe(
      "existing client"
    );
  });

  it("discovers matching scoped client/server entries, redirects, and custom render templates", async () => {
    const { tempDir, templatesDir, project } = createProject("brand");
    const scopedDir = path.join(templatesDir, "brand");
    const redirectsDir = path.join(tempDir, "redirects");
    fs.mkdirSync(scopedDir);
    fs.mkdirSync(redirectsDir);
    for (const filename of [
      "page.tsx",
      "shared.ts",
      "page.client.tsx",
      "notes.txt",
      "_client17.tsx",
    ]) {
      fs.writeFileSync(path.join(templatesDir, filename), "");
    }
    for (const filename of ["page.jsx", "_client.tsx", "_server.tsx", "page.client.jsx"]) {
      fs.writeFileSync(path.join(scopedDir, filename), "");
    }
    fs.writeFileSync(path.join(redirectsDir, "redirect.ts"), "");

    const inputs = await discoverInputs(
      project.getTemplatePaths(),
      project.getRedirectPaths(),
      project
    );
    expect(inputs).toEqual({
      "server/page": path.join(scopedDir, "page.jsx"),
      "client/page": getClientTemplateId(path.join(scopedDir, "page.jsx")),
      "server/shared": path.join(templatesDir, "shared.ts"),
      "client/shared": getClientTemplateId(path.join(templatesDir, "shared.ts")),
      "redirect/redirect": path.join(redirectsDir, "redirect.ts"),
      "render/_client": path.join(scopedDir, "_client.tsx"),
      "render/_server": path.join(scopedDir, "_server.tsx"),
    });
    expect(fs.readFileSync(path.join(templatesDir, "page.client.tsx"), "utf8")).toBe("");
  });
});
