import React from "react";
import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import { TemplateProps } from "../../../../common/src/template/types.js";
import { generateResponses } from "./templateUtils.js";
import path from "node:path";

const baseTemplateModule: TemplateModuleInternal<any, any> = {
  path: "path",
  filename: "filename",
  templateName: "template",
  config: { name: "name" },
  getPath: () => {
    return "path";
  },
  default: () => <div></div>,
};

const baseProps: TemplateProps = {
  document: {},
  __meta: {
    mode: "development",
    manifest: {
      bundlePaths: {},
      renderPaths: {},
      projectFilepaths: {
        templatesRoot: "",
        distRoot: "",
        hydrationBundleOutputRoot: "",
        serverBundleOutputRoot: "",
      },
      bundlerManifest: {},
    },
  },
};

describe("generateResponses", () => {
  it("calls transformProps when transformProps is defined", async () => {
    const fn = jest.fn((props) => props);
    await generateResponses(
      { ...baseTemplateModule, transformProps: fn },
      baseProps,
      path.join(process.cwd(), "src/common/src/template/internal/_client.tsx"),
      path.join(process.cwd(), "src/common/src/template/internal/_server.tsx")
    );
    expect(fn).toHaveBeenCalled();
  });

  it("calls getRedirects when getRedirects is defined", async () => {
    const fn = jest.fn();
    await generateResponses(
      { ...baseTemplateModule, getRedirects: fn },
      baseProps,
      path.join(process.cwd(), "src/common/src/template/internal/_client.tsx"),
      path.join(process.cwd(), "src/common/src/template/internal/_server.tsx")
    );
    expect(fn).toHaveBeenCalled();
  });
});
