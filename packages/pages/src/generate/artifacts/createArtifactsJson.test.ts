import { describe, it, expect } from "vitest";
import { ArtifactsConfig } from "../../common/src/artifacts/internal/types.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { getArtifactsConfig } from "./createArtifactsJson.js";

describe("createArtifactsJson - getArtifactsConfig", () => {
  const projectStructure = new ProjectStructure();

  it("creates the proper default artifact structure", async () => {
    const expected: ArtifactsConfig = {
      artifactStructure: {
        assets: [
          {
            root: "dist",
            pattern: "assets/**/*",
          },
          {
            root: "dist",
            pattern: "*",
          },
        ],
        plugins: [
          {
            pluginName: "PagesGenerator",
            sourceFiles: [
              {
                root: "dist/plugin",
                pattern: "*{.ts,.json}",
              },
              {
                root: "dist",
                pattern:
                  "assets/{server,static,renderer,render}/**/*{.js,.css}",
              },
            ],
            event: "ON_PAGE_GENERATE",
            functionName: "PagesGenerator",
          },
        ],
      },
    };

    expect(getArtifactsConfig(projectStructure)).resolves.toEqual(expected);
  });
});
