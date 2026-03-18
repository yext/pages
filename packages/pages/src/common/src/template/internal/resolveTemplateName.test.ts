import { describe, expect, it } from "vitest";
import { getDocumentTemplateName } from "./resolveTemplateName.js";

const baseDocument = {
  __: {
    codeTemplate: "legacy-template",
    name: "page-set-name",
  },
};

describe("getDocumentTemplateName", () => {
  it("prefers _pageset.config.template over codeTemplate", () => {
    expect(
      getDocumentTemplateName({
        ...baseDocument,
        _pageset: JSON.stringify({
          config: {
            template: "accounts/123/visualEditorTemplates/main",
          },
        }),
      })
    ).toBe("accounts/123/visualEditorTemplates/main");
  });

  it("supports _pageset when it is already an object", () => {
    expect(
      getDocumentTemplateName({
        ...baseDocument,
        _pageset: {
          config: {
            template: "accounts/123/visualEditorTemplates/main",
          },
        },
      })
    ).toBe("accounts/123/visualEditorTemplates/main");
  });

  it("falls back when _pageset cannot be parsed", () => {
    expect(
      getDocumentTemplateName({
        ...baseDocument,
        _pageset: "{not-json",
      })
    ).toBe("legacy-template");
  });

  it("falls back to document.__.codeTemplate", () => {
    expect(getDocumentTemplateName(baseDocument)).toBe("legacy-template");
  });

  it("falls back to codeTemplate when _pageset.config.template is blank", () => {
    expect(
      getDocumentTemplateName({
        ...baseDocument,
        _pageset: JSON.stringify({
          config: {
            template: "   ",
          },
        }),
      })
    ).toBe("legacy-template");
  });

  it("falls back to document.__.name when codeTemplate is blank", () => {
    expect(
      getDocumentTemplateName({
        ...baseDocument,
        __: {
          ...baseDocument.__,
          codeTemplate: "   ",
        },
      })
    ).toBe("page-set-name");
  });

  it("falls back to document.__.name", () => {
    expect(
      getDocumentTemplateName({
        ...baseDocument,
        __: {
          ...baseDocument.__,
          codeTemplate: undefined,
        },
      })
    ).toBe("page-set-name");
  });
});
