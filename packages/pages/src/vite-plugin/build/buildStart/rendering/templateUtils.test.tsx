import { describe, it, expect, vi } from "vitest";
import React from "react";
import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import {
  ServerRenderTemplate,
  TemplateProps,
  Manifest,
} from "../../../../common/src/template/types.js";
import { generateTemplateResponses } from "./templateUtils.js";
import path from "node:path";

const baseTemplateModule: TemplateModuleInternal<any, any> = {
  path: "path",
  filename: "filename",
  templateName: "template",
  config: {
    name: "name",
    hydrate: false,
    templateType: "entity",
  },
  getPath: () => {
    return "path";
  },
  default: () => <div></div>,
};

const manifest: Manifest = {
  serverPaths: {},
  redirectPaths: {},
  clientPaths: {},
  renderPaths: {},
  projectStructure: {
    rootFolders: {
      source: "src",
      dist: "dist",
      sitesConfig: "sites-config",
      functions: "functions",
    },
    subfolders: {
      templates: "templates",
      modules: "modules",
      redirects: "redirects",
      serverlessFunctions: "functions",
      assets: "assets",
      public: "public",
      clientBundle: "client",
      serverBundle: "server",
      redirectBundle: "redirect",
      renderBundle: "render",
      renderer: "renderer",
      static: "static",
      plugin: "plugin",
    },
    sitesConfigFiles: {
      ci: "ci.json",
      features: "features.json",
      siteStream: "site-stream.json",
      serving: "serving.json",
      sitemap: "sitemap.json",
      redirects: "redirects.csv",
      auth: "auth.json",
    },
    distConfigFiles: {
      templates: "templates.json",
      artifacts: "artifacts.json",
      functionMetadata: "functionMetadata.json",
    },
    rootFiles: {
      config: "config.yaml",
      templateManifest: ".template-manifest.json",
    },
    envVarConfig: {
      envVarDir: "",
      envVarPrefix: "YEXT_PUBLIC",
    },
  },
  bundlerManifest: {},
};

const baseProps: TemplateProps = {
  document: {},
  __meta: {
    mode: "development",
  },
};

const serverRenderTemplate: ServerRenderTemplate = {
  render: () => {
    return Promise.resolve("");
  },
  getIndexHtml: async () => {
    return `<!DOCTYPE html>
      <html lang="<!--app-lang-->">
        <head></head>
        <body>
          <div id="reactele"><!--REPLACE-ME></div>
        </body>
      </html>`;
  },
  getReplacementTag: async () => {
    return "<!--REPLACE-ME>";
  },
  indexHtml: "",
  replacementTag: "",
};

describe("generateResponses", () => {
  it("calls transformProps when transformProps is defined", async () => {
    const fn = vi.fn((props) => props);
    await generateTemplateResponses(
      { ...baseTemplateModule, transformProps: fn },
      baseProps,
      {
        client: path.join(process.cwd(), "src/common/src/template/internal/_client.tsx"),
        server: serverRenderTemplate,
      },
      manifest
    );
    expect(fn).toHaveBeenCalled();
  });

  it("calls getRedirects when getRedirects is defined", async () => {
    const fn = vi.fn();
    await generateTemplateResponses(
      { ...baseTemplateModule, getRedirects: fn },
      baseProps,
      {
        client: path.join(process.cwd(), "src/common/src/template/internal/_client.tsx"),
        server: serverRenderTemplate,
      },
      manifest
    );
    expect(fn).toHaveBeenCalled();
  });
});
