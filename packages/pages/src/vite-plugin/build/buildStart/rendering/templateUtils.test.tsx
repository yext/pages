import React from "react";
import { TemplateModuleInternal } from "../../../../common/src/template/internal/types";
import { TemplateProps } from "../../../../common/src/template/types";
import { generateResponses } from "./templateUtils";

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
    const fn = jest.fn(props => props);
    await generateResponses(
      { ...baseTemplateModule, transformProps: fn },
      baseProps
    );
    expect(fn).toHaveBeenCalled();
  });

  it("calls getRedirects when getRedirects is defined", async () => {
    const fn = jest.fn();
    await generateResponses(
      { ...baseTemplateModule, getRedirects: fn },
      baseProps
    );
    expect(fn).toHaveBeenCalled();
  });
});
