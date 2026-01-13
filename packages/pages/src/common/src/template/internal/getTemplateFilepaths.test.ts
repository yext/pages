import { describe, it, expect, vi } from "vitest";
import path from "node:path";
import {
  getGlobalClientServerRenderTemplates,
  getTemplateFilepaths,
} from "./getTemplateFilepaths.js";
import { Path } from "../../project/path.js";

describe("getTemplateFilepaths", () => {
  it("collects all template files from root folder path", async () => {
    const rootPath = path.join("src", "templates");

    const util = await import("./util.js");
    vi.spyOn(util, "globSync").mockImplementation(() => [
      path.join(rootPath, "share.tsx"),
      path.join(rootPath, "test.tsx"),
    ]);

    const templatesFilepath = getTemplateFilepaths([new Path(path.join(process.cwd(), rootPath))]);
    expect(templatesFilepath.sort()).toEqual(
      [path.join(rootPath, "share.tsx"), path.join(rootPath, "test.tsx")].sort()
    );
  });

  it("collects template files from domain and root folder paths", async () => {
    const rootPath = path.join("src", "templates");
    const domain1Path = path.join("src", "templates", "some.domain1.com");

    const util = await import("./util.js");
    vi.spyOn(util, "globSync").mockImplementation(() => [
      path.join(domain1Path, "brand1.tsx"),
      path.join(domain1Path, "test.tsx"),
      path.join(rootPath, "share.tsx"),
      path.join(rootPath, "test.tsx"),
    ]);

    const templatesFilepath = getTemplateFilepaths([
      new Path(path.join(process.cwd(), domain1Path)),
      new Path(path.join(process.cwd(), rootPath)),
    ]);
    expect(templatesFilepath.sort()).toEqual(
      [
        path.join(rootPath, "share.tsx"),
        path.join(domain1Path, "test.tsx"),
        path.join(domain1Path, "brand1.tsx"),
      ].sort()
    );
  });

  describe("getGlobalClientServerRenderTemplates", async () => {
    it("uses React 17 client template when no custom client", async () => {
      const rootPath = path.join("src", "templates");
      const util = await import("./util.js");
      vi.spyOn(util, "getReactVersion").mockImplementation(() => 17);
      vi.spyOn(util, "globSync").mockImplementation(() => [
        path.join(rootPath, "_client.tsx"),
        path.join(rootPath, "_server.tsx"),
        path.join(rootPath, "custom.tsx"),
      ]);

      const clientServerRenderTemplates = getGlobalClientServerRenderTemplates([
        new Path(path.join(process.cwd(), rootPath)),
      ]);

      expect(clientServerRenderTemplates.isCustomRenderTemplate).toBeFalsy();
      expect(path.basename(clientServerRenderTemplates.clientRenderTemplatePath)).toEqual(
        "_client17.js"
      );
    });

    it("uses React 18 client template when no custom client", async () => {
      const rootPath = path.join("src", "templates");
      const util = await import("./util.js");
      vi.spyOn(util, "getReactVersion").mockImplementation(() => 18);
      vi.spyOn(util, "globSync").mockImplementation(() => [
        path.join(rootPath, "_client.tsx"),
        path.join(rootPath, "_server.tsx"),
        path.join(rootPath, "custom.tsx"),
      ]);

      const clientServerRenderTemplates = getGlobalClientServerRenderTemplates([
        new Path(path.join(process.cwd(), rootPath)),
      ]);

      expect(clientServerRenderTemplates.isCustomRenderTemplate).toBeFalsy();
      expect(path.basename(clientServerRenderTemplates.clientRenderTemplatePath)).toEqual(
        "_client.js"
      );
    });

    it("uses custom client template when React 17", async () => {
      const rootPath = path.join("src", "templates");
      const util = await import("./util.js");
      vi.spyOn(util, "getReactVersion").mockImplementation(() => 17);
      vi.spyOn(util, "globSync").mockImplementation(() => [
        path.join(rootPath, "_client.tsx"),
        path.join(rootPath, "_server.tsx"),
        path.join(rootPath, "custom.tsx"),
      ]);
      vi.spyOn(util, "existsSync").mockImplementation(() => true);

      const clientServerRenderTemplates = getGlobalClientServerRenderTemplates([
        new Path(path.join(process.cwd(), rootPath)),
      ]);

      expect(clientServerRenderTemplates.isCustomRenderTemplate).toBeTruthy();
      expect(path.basename(clientServerRenderTemplates.clientRenderTemplatePath)).toEqual(
        "_client.tsx"
      );
    });

    it("uses custom client template when React 18", async () => {
      const rootPath = path.join("src", "templates");
      const util = await import("./util.js");
      vi.spyOn(util, "getReactVersion").mockImplementation(() => 18);
      vi.spyOn(util, "globSync").mockImplementation(() => [
        path.join(rootPath, "_client.tsx"),
        path.join(rootPath, "_server.tsx"),
        path.join(rootPath, "custom.tsx"),
      ]);
      vi.spyOn(util, "existsSync").mockImplementation(() => true);

      const clientServerRenderTemplates = getGlobalClientServerRenderTemplates([
        new Path(path.join(process.cwd(), rootPath)),
      ]);

      expect(clientServerRenderTemplates.isCustomRenderTemplate).toBeTruthy();
      expect(path.basename(clientServerRenderTemplates.clientRenderTemplatePath)).toEqual(
        "_client.tsx"
      );
    });
  });
});
