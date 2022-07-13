import {
  convertTemplateModuleToTemplateModuleInternal,
} from "../../../src/template/internal/types";

describe("internal/types - convertTemplateModuleToTemplateModuleInternal", () => {
  it("uses the filename as the config name when not set", async () => {
    const templateModule = {
      default: {},
      getPath: () => "",
      getHeadConfig: () => {
        return {
          title: "foo",
        };
      },
      config: {
        streamId: "$id",
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        "src/templates/myTemplateName.tsx",
        templateModule,
        false
      );

    const expected = {
      default: {},
      getPath: () => "",
      getHeadConfig: () => {
        return {
          title: "foo",
        };
      },
      config: {
        name: "myTemplateName",
        streamId: "$id",
      },
      path: "src/templates/myTemplateName.tsx",
      filename: "myTemplateName.tsx",
      templateName: "myTemplateName",
    };

    expect(JSON.stringify(templateConfigInternal)).toEqual(
      JSON.stringify(expected)
    );
  });
});
