import { describe, it, expect, vi } from "vitest";
import React from "react";
import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import {
  RenderTemplate,
  TemplateProps,
  Manifest,
} from "../../../../common/src/template/types.js";
import { generateResponses } from "./templateUtils.js";
import path from "node:path";
import { ProjectStructure } from "../../../../common/src/project/structure.js";

const baseTemplateModule: TemplateModuleInternal<any, any> = {
  path: "path",
  filename: "filename",
  templateName: "template",
  config: {
    name: "name",
    hydrate: false,
  },
  getPath: () => {
    return "path";
  },
  default: () => <div></div>,
  templateType: "entity",
};

const manifest: Manifest = {
  serverPaths: {},
  clientPaths: {},
  renderPaths: {},
  projectStructure: new ProjectStructure().config,
  bundlerManifest: {},
};

const baseProps: TemplateProps = {
  document: {},
  __meta: {
    mode: "development",
  },
};

const serverRenderTemplate: RenderTemplate = {
  render: () => {
    return Promise.resolve(
      `<!DOCTYPE html>
        <html lang="<!--app-lang-->">
          <head></head>
          <body>
            <div id="reactele"></div>
          </body>
        </html>`
    );
  },
};

describe("generateResponses", () => {
  const projectStructure = new ProjectStructure();

  it("calls transformProps when transformProps is defined", async () => {
    const fn = vi.fn((props) => props);
    await generateResponses(
      { ...baseTemplateModule, transformProps: fn },
      baseProps,
      {
        client: path.join(
          process.cwd(),
          "src/common/src/template/internal/_client.tsx"
        ),
        server: serverRenderTemplate,
      },
      manifest,
      projectStructure
    );
    expect(fn).toHaveBeenCalled();
  });

  it("calls getRedirects when getRedirects is defined", async () => {
    const fn = vi.fn();
    await generateResponses(
      { ...baseTemplateModule, getRedirects: fn },
      baseProps,
      {
        client: path.join(
          process.cwd(),
          "src/common/src/template/internal/_client.tsx"
        ),
        server: serverRenderTemplate,
      },
      manifest,
      projectStructure
    );
    expect(fn).toHaveBeenCalled();
  });
});
