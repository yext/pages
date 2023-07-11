import React from "react";
import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import {
  RenderTemplate,
  TemplateProps,
  Manifest,
} from "../../../../common/src/template/types.js";
import { generateResponses } from "./templateUtils.js";
import path from "node:path";

const baseTemplateModule: TemplateModuleInternal<any, any> = {
  path: "path",
  filename: "filename",
  templateName: "template",
  config: {
    name: "name",
    hydrate: true,
  },
  getPath: () => {
    return "path";
  },
  default: () => <div></div>,
};

const manifest: Manifest = {
  bundlePaths: {},
  renderPaths: {},
  projectFilepaths: {
    templatesRoot: "",
    distRoot: "",
    serverBundleOutputRoot: "",
  },
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
  it("calls transformProps when transformProps is defined", async () => {
    const fn = jest.fn((props) => props);
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
      manifest
    );
    expect(fn).toHaveBeenCalled();
  });

  it("calls getRedirects when getRedirects is defined", async () => {
    const fn = jest.fn();
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
      manifest
    );
    expect(fn).toHaveBeenCalled();
  });
});
