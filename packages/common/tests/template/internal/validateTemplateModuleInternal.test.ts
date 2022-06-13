import { TemplateConfigInternal } from "../../../src/template/internal/types";
import { validateConfig } from "../../../src/template/internal/validateTemplateModuleInternal";

describe("validateTemplateModuleInternal - validateConfig", () => {
  it("validates that both streamId and stream are not defined", async () => {
    const templateConfigInternal: TemplateConfigInternal = {
      name: "",
      //   streamId: "$id",
      //   stream: {
      //     $id: "$id",
      //     fields: ["foo"],
      //     filter: {},
      //     localization: {
      //       primary: true,
      //     },
      //   },
    };

    const validateConfigFunc = () =>
      validateConfig("foo.tsx", templateConfigInternal);

    expect(validateConfigFunc).toThrowError(
      `Template foo.tsx is missing a "name" in the config function.`
    );
  });
});
