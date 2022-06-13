import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../src/template/internal/types";
import { TemplateModule } from "../../../src/template/types";

describe("internal/types - convertTemplateModuleToTemplateModuleInternal", () => {
  it("uses the filename as the config name when not set", async () => {
    const templateModule: TemplateModule<any> = {
      default: null,
      getPath: () => "",
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

    const expected: TemplateModuleInternal<any> = {
      default: null,
      getPath: () => "",
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

  it("overrides the config.name when defined", async () => {
    const templateModule: TemplateModule<any> = {
      default: null,
      getPath: () => "",
      config: {
        name: "myOverriddenName",
        streamId: "$id",
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        "src/templates/myTemplateName.tsx",
        templateModule,
        false
      );

    const expected: TemplateModuleInternal<any> = {
      default: null,
      getPath: () => "",
      config: {
        name: "myOverriddenName",
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

  it("uses the filename as the config name when not set and removes the asset fingerprint", async () => {
    const templateModule: TemplateModule<any> = {
      default: null,
      getPath: () => "",
      config: {
        streamId: "$id",
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        "src/templates/myTemplateName.0ab33d.tsx",
        templateModule,
        true
      );

    const expected: TemplateModuleInternal<any> = {
      default: null,
      getPath: () => "",
      config: {
        name: "myTemplateName",
        streamId: "$id",
      },
      path: "src/templates/myTemplateName.0ab33d.tsx",
      filename: "myTemplateName.tsx",
      templateName: "myTemplateName",
    };

    expect(JSON.stringify(templateConfigInternal)).toEqual(
      JSON.stringify(expected)
    );
  });
});
