import { describe, expect, it } from "vitest";
import { getDocumentTemplateName } from "./resolveTemplateName.js";

describe("getDocumentTemplateName", () => {
  it("prefers _pageset.config.template over codeTemplate", () => {
    expect(
      getDocumentTemplateName({
        _pageset: JSON.stringify({
          config: {
            template: "accounts/123/visualEditorTemplates/main",
          },
        }),
        __: {
          codeTemplate: "legacy-template",
          name: "page-set-name",
        },
      })
    ).toBe("accounts/123/visualEditorTemplates/main");
  });

  it("supports _pageset when it is already an object", () => {
    expect(
      getDocumentTemplateName({
        _pageset: {
          config: {
            template: "accounts/123/visualEditorTemplates/main",
          },
        },
        __: {
          codeTemplate: "legacy-template",
          name: "page-set-name",
        },
      })
    ).toBe("accounts/123/visualEditorTemplates/main");
  });

  it("falls back when _pageset cannot be parsed", () => {
    expect(
      getDocumentTemplateName({
        _pageset: "{not-json",
        __: {
          codeTemplate: "legacy-template",
          name: "page-set-name",
        },
      })
    ).toBe("legacy-template");
  });

  it("falls back to document.__.codeTemplate", () => {
    expect(
      getDocumentTemplateName({
        __: {
          codeTemplate: "legacy-template",
          name: "page-set-name",
        },
      })
    ).toBe("legacy-template");
  });

  it("falls back to codeTemplate when _pageset.config.template is blank", () => {
    expect(
      getDocumentTemplateName({
        _pageset: JSON.stringify({
          config: {
            template: "   ",
          },
        }),
        __: {
          codeTemplate: "legacy-template",
          name: "page-set-name",
        },
      })
    ).toBe("legacy-template");
  });

  it("falls back to document.__.name when codeTemplate is blank", () => {
    expect(
      getDocumentTemplateName({
        __: {
          codeTemplate: "   ",
          name: "page-set-name",
        },
      })
    ).toBe("page-set-name");
  });

  it("falls back to document.__.name", () => {
    expect(
      getDocumentTemplateName({
        __: {
          name: "page-set-name",
        },
      })
    ).toBe("page-set-name");
  });
});
