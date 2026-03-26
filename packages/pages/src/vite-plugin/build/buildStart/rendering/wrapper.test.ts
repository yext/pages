import { describe, expect, it } from "vitest";
import { ProjectStructure } from "../../../../common/src/project/structure.js";
import { Manifest } from "../../../../common/src/template/types.js";
import { findOriginalTemplatePathInManifest } from "./wrapper.js";

describe("findOriginalTemplatePathInManifest", () => {
  it("finds the source template path from the emitted server bundle path", () => {
    const manifest: Manifest = {
      serverPaths: {
        "edit-template-id": "assets/server/edit-template-id.abc123.js",
      },
      redirectPaths: {},
      clientPaths: {},
      renderPaths: {},
      projectStructure: new ProjectStructure().config,
      bundlerManifest: {
        "src/templates/edit.tsx": {
          file: "assets/server/edit-template-id.abc123.js",
          src: "src/templates/edit.tsx",
          isEntry: true,
          css: ["assets/static/edit.css"],
        },
      },
    };

    expect(
      findOriginalTemplatePathInManifest(manifest, manifest.serverPaths["edit-template-id"])
    ).toEqual("src/templates/edit.tsx");
  });
});
