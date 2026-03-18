import { describe, expect, it } from "vitest";
import { getDocumentTemplateName, hasDocumentTemplateMetadata } from "./resolveTemplateName.js";

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

describe("hasDocumentTemplateMetadata", () => {
  it("is true when _pageset.config.template exists", () => {
    expect(
      hasDocumentTemplateMetadata({
        _pageset: JSON.stringify({
          config: {
            template: "accounts/123/visualEditorTemplates/main",
          },
        }),
      })
    ).toBe(true);
  });

  it("falls back to codeTemplate metadata", () => {
    expect(
      hasDocumentTemplateMetadata({
        __: {
          codeTemplate: "legacy-template",
        },
      })
    ).toBe(true);
  });

  it("is false when neither source exists", () => {
    expect(
      hasDocumentTemplateMetadata({
        __: {
          name: "page-set-name",
        },
      })
    ).toBe(false);
  });
});
