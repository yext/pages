import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "./types";
import { Template, TemplateModule } from "../types";

describe("internal/types - convertTemplateModuleToTemplateModuleInternal", () => {
  it("uses the filename as the config name when not set", async () => {
    const templateModule: TemplateModule<any, any> = {
      default: {} as Template<any>,
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

    const expected: TemplateModuleInternal<any, any> = {
      default: {} as Template<any>,
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

  it("overrides the config.name when defined", async () => {
    const templateModule: TemplateModule<any, any> = {
      default: {} as Template<any>,
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

    const expected: TemplateModuleInternal<any, any> = {
      default: {} as Template<any>,
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
    const templateModule: TemplateModule<any, any> = {
      default: {} as Template<any>,
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

    const expected: TemplateModuleInternal<any, any> = {
      default: {} as Template<any>,
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