import { describe, it, expect } from "vitest";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "./types.js";
import { Template, TemplateModule } from "../types.js";
import path from "path";

const myTemplateNamePath = path.join("src", "templates", "myTemplateName.tsx");

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
        hydrate: false,
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        myTemplateNamePath,
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
        hydrate: false,
        streamId: "$id",
        templateType: "entity",
      },
      path: myTemplateNamePath,
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
        hydrate: false,
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        myTemplateNamePath,
        templateModule,
        false
      );

    const expected: TemplateModuleInternal<any, any> = {
      default: {} as Template<any>,
      getPath: () => "",
      config: {
        name: "myOverriddenName",
        hydrate: false,
        streamId: "$id",
        templateType: "entity",
      },
      path: myTemplateNamePath,
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
        hydrate: false,
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        path.join("src", "templates", "myTemplateName.0ab33d.tsx"),
        templateModule,
        true
      );

    const expected: TemplateModuleInternal<any, any> = {
      default: {} as Template<any>,
      getPath: () => "",
      config: {
        name: "myTemplateName",
        hydrate: false,
        streamId: "$id",
        templateType: "entity",
      },
      path: path.join("src", "templates", "myTemplateName.0ab33d.tsx"),
      filename: "myTemplateName.tsx",
      templateName: "myTemplateName",
    };

    expect(JSON.stringify(templateConfigInternal)).toEqual(
      JSON.stringify(expected)
    );
  });

  it("defaults hydrate to true when not set", async () => {
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
        myTemplateNamePath,
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
        hydrate: true,
        streamId: "$id",
        templateType: "entity",
      },
      path: myTemplateNamePath,
      filename: "myTemplateName.tsx",
      templateName: "myTemplateName",
    };

    expect(JSON.stringify(templateConfigInternal)).toEqual(
      JSON.stringify(expected)
    );
  });

  it("converts hydrate to false whenever hydrate is set to false", async () => {
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
        hydrate: false,
      },
    };

    const templateConfigInternal =
      convertTemplateModuleToTemplateModuleInternal(
        myTemplateNamePath,
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
        hydrate: false,
        streamId: "$id",
        templateType: "entity",
      },
      path: myTemplateNamePath,
      filename: "myTemplateName.tsx",
      templateName: "myTemplateName",
    };

    expect(JSON.stringify(templateConfigInternal)).toEqual(
      JSON.stringify(expected)
    );
  });
});
