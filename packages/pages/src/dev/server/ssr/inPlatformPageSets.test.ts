import { describe, expect, it } from "vitest";
import { getPageSetTemplateName, PageSetConfig } from "./inPlatformPageSets.js";

const pageSet = {
  id: "locations",
  name: "sites/test/pagesets/locations",
  display_name: "Locations",
  code_template: "legacy-template",
  config: {
    template: "accounts/123/visualEditorTemplates/new-template",
  },
  scope: {
    locales: ["en"],
    saved_filters: [],
    entity_types: ["location"],
  },
} satisfies PageSetConfig;

describe("getPageSetTemplateName", () => {
  it("prefers config.template over code_template", () => {
    expect(getPageSetTemplateName(pageSet)).toBe("new-template");
  });

  it("supports plain template ids in config.template", () => {
    expect(
      getPageSetTemplateName({
        ...pageSet,
        config: {
          template: "new-template",
        },
      })
    ).toBe("new-template");
  });

  it("falls back to code_template when config.template is blank", () => {
    expect(
      getPageSetTemplateName({
        ...pageSet,
        config: {
          template: "   ",
        },
      })
    ).toBe("legacy-template");
  });

  it("falls back to code_template", () => {
    expect(
      getPageSetTemplateName({
        ...pageSet,
        config: undefined,
      })
    ).toBe("legacy-template");
  });

  it("returns undefined when no template metadata exists", () => {
    expect(
      getPageSetTemplateName({
        ...pageSet,
        code_template: undefined,
        config: undefined,
      })
    ).toBeUndefined();
  });
});
