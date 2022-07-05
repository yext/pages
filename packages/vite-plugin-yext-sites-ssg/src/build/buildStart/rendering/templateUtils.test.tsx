import React from "react";
import { TemplateModuleInternal } from "../../../../../common/src/template/internal/types";
import { TemplateProps } from "../../../../../common/src/template/types";
import { generateResponses } from "./templateUtils";

const baseTemplateModule: TemplateModuleInternal<any> = {
  path: "path",
  filename: "filename",
  templateName: "template",
  config: { name: "name" },
  getPath: (props) => {
    return "path";
  },
  default: () => <div></div>,
};

const baseProps: TemplateProps = {
  document: {},
  __meta: { mode: "development" },
};

describe("generateResponses", () => {
  it("calls getStaticProps when getStaticProps is defined", async () => {
    const fn = jest.fn();
    await generateResponses(
      { ...baseTemplateModule, getStaticProps: fn },
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
