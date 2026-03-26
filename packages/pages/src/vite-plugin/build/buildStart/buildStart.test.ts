import path from "node:path";
import { describe, expect, it } from "vitest";
import { Path } from "../../../common/src/project/path.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { discoverInputs, resolveTemplateEntryName } from "./buildStart.js";

const projectStructure = new ProjectStructure();
const templateFixturesPath = path.join(process.cwd(), "tests/fixtures/buildStartTemplates");

describe("buildStart", () => {
  it("uses config.name as the emitted entry name for edit templates", async () => {
    const actual = await resolveTemplateEntryName(
      path.join(templateFixturesPath, "edit.tsx"),
      projectStructure
    );

    expect(actual).toEqual("edit-template-id");
  });

  it("uses the sibling edit template config.name for edit.client templates", async () => {
    const actual = await resolveTemplateEntryName(
      path.join(templateFixturesPath, "edit.client.tsx"),
      projectStructure
    );

    expect(actual).toEqual("edit-template-id");
  });

  it("keeps non-edit templates filename-based while renaming edit server and client entries", async () => {
    const actual = await discoverInputs([new Path(templateFixturesPath)], [], projectStructure);

    expect(actual).toMatchObject({
      "server/edit-template-id": path.join(templateFixturesPath, "edit.tsx"),
      "client/edit-template-id": path.join(templateFixturesPath, "edit.client.tsx"),
      "server/location": path.join(templateFixturesPath, "location.tsx"),
    });
  });
});
