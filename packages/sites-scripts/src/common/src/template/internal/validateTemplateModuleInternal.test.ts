import {
  TemplateConfigInternal,
  TemplateModuleInternal,
} from "../../../src/template/internal/types";
import {
  validateConfig,
  validateTemplateModuleInternal,
} from "../../../src/template/internal/validateTemplateModuleInternal";
import { Default } from "../../../src/template/types";

describe("validateTemplateModuleInternal - validateConfig", () => {
  it("validates that a config name is defined", async () => {
    const templateConfigInternal: TemplateConfigInternal = {
      name: "",
    };

    const validateConfigFunc = () =>
      validateConfig("foo.tsx", templateConfigInternal);

    expect(validateConfigFunc).toThrowError(
      `Template foo.tsx is missing a "name" in the config function.`
    );
  });

  it("validates that both a streamId and stream are not defined", async () => {
    const templateConfigInternal: TemplateConfigInternal = {
      name: "foo",
      streamId: "$id",
      stream: {
        $id: "$id",
        fields: ["foo"],
        filter: {},
        localization: {
          primary: true,
        },
      },
    };

    const validateConfigFunc = () =>
      validateConfig("foo.tsx", templateConfigInternal);

    expect(validateConfigFunc).toThrowError(
      `Template foo.tsx must not define both a "streamId" and a "stream".`
    );
  });
});

describe("validateTemplateModuleInternal - validateTemplateModuleInternal", () => {
  it("validates that getPath is defined", async () => {
    const templateModuleInteral: Partial<TemplateModuleInternal<any, any>> = {
      default: undefined,
      getPath: undefined,
      getRedirects: undefined,
      templateName: "foo",
      filename: "foo.tsx",
      path: "/src/templates/foo.tsx",
      config: {
        name: "foo",
        streamId: "$id",
      },
    };

    const validateTemplateModuleInternalFunc = () =>
      validateTemplateModuleInternal(templateModuleInteral as TemplateModuleInternal<any, any>);

    expect(validateTemplateModuleInternalFunc).toThrowError(
      `Template foo.tsx is missing an exported getPath function.`
    );
  });

  it("validates that at least one of default or render is defined", async () => {
    const templateModuleInteral: Partial<TemplateModuleInternal<any, any>> = {
      default: undefined,
      getPath: () => "",
      getRedirects: () => [],
      templateName: "foo",
      filename: "foo.tsx",
      path: "/src/templates/foo.tsx",
      config: {
        name: "foo",
        streamId: "$id",
      },
    };

    const validateTemplateModuleInternalFunc = () =>
      validateTemplateModuleInternal(templateModuleInteral as TemplateModuleInternal<any, any>);

    expect(validateTemplateModuleInternalFunc).toThrowError(
      `Module foo.tsx does not have the necessary exports to produce page. ` +
        "A module should either have a React component as a default export or a render function."
    );
  });

  it("doesn't throw an error when the template is valid", async () => {
    const templateModuleInteral: TemplateModuleInternal<any, any> = {
      default: {} as Default<any>,
      getPath: () => "",
      templateName: "foo",
      filename: "foo.tsx",
      path: "/src/templates/foo.tsx",
      getRedirects: () => [],
      config: {
        name: "foo",
        streamId: "$id",
      },
    };

    const validateTemplateModuleInternalFunc = () =>
      validateTemplateModuleInternal(templateModuleInteral);

    expect(validateTemplateModuleInternalFunc).not.toThrow();
  });
});
