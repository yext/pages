import { describe, it, expect } from "vitest";
import { CiConfig } from "../../common/src/ci/ci.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { getUpdatedCiConfig } from "./ci.js";

describe("ci - getUpdatedCiConfig", () => {
  const projectStructure = new ProjectStructure();

  it("adds the Generator plugin to the config if it does not exist", async () => {
    const input: CiConfig = {
      artifactStructure: {
        assets: [
          {
            root: "dist",
            pattern: "assets/**/*",
          },
        ],
        features: "sites-config/features.json",
      },
      dependencies: {
        installDepsCmd: "npm install",
        requiredFiles: ["package.json", "package-lock.json", ".npmrc"],
      },
      buildArtifacts: {
        buildCmd: "npm run build:local",
      },
      livePreview: {
        serveSetupCmd: ":",
      },
    };

    const expected: CiConfig = {
      artifactStructure: {
        assets: [
          {
            root: "dist",
            pattern: "assets/**/*",
          },
          {
            root: "dist",
            pattern: "modules/**/*",
          },
          {
            root: "dist/public_assets",
            pattern: "**/*",
          },
        ],
        features: "sites-config/features.json",
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
                  "assets/{server,static,renderer,render,client}/**/*{.js,.css}",
              },
              {
                root: "dist/modules",
                pattern: "*{.js}",
              },
            ],
            event: "ON_PAGE_GENERATE",
            functionName: "PagesGenerator",
          },
        ],
      },
      dependencies: {
        installDepsCmd: "npm install",
        requiredFiles: ["package.json", "package-lock.json", ".npmrc"],
      },
      buildArtifacts: {
        buildCmd: "npm run build:local",
      },
      livePreview: {
        serveSetupCmd: ":",
      },
    };

    expect(getUpdatedCiConfig(input, projectStructure)).resolves.toEqual(
      expected
    );
  });

  it("updates the Generator plugin if it exists", async () => {
    const input: CiConfig = {
      artifactStructure: {
        assets: [
          {
            root: "dist",
            pattern: "assets/**/*",
          },
        ],
        features: "sites-config/features.json",
        plugins: [
          {
            pluginName: "Generator",
            sourceFiles: [
              {
                root: "dist/plugin",
                pattern: "*{.ts,.json}",
              },
              {
                root: "dist",
                pattern: "uh oh",
              },
            ],
            event: "ON_PAGE_GENERATE",
            functionName: "PagesGenerator",
          },
        ],
      },
      dependencies: {
        installDepsCmd: "npm install",
        requiredFiles: ["package.json", "package-lock.json", ".npmrc"],
      },
      buildArtifacts: {
        buildCmd: "npm run build:local",
      },
      livePreview: {
        serveSetupCmd: ":",
      },
    };

    const expected: CiConfig = {
      artifactStructure: {
        assets: [
          {
            root: "dist",
            pattern: "assets/**/*",
          },
          {
            root: "dist",
            pattern: "modules/**/*",
          },
          {
            root: "dist/public_assets",
            pattern: "**/*",
          },
        ],
        features: "sites-config/features.json",
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
                  "assets/{server,static,renderer,render,client}/**/*{.js,.css}",
              },
              {
                root: "dist/modules",
                pattern: "*{.js}",
              },
            ],
            event: "ON_PAGE_GENERATE",
            functionName: "PagesGenerator",
          },
        ],
      },
      dependencies: {
        installDepsCmd: "npm install",
        requiredFiles: ["package.json", "package-lock.json", ".npmrc"],
      },
      buildArtifacts: {
        buildCmd: "npm run build:local",
      },
      livePreview: {
        serveSetupCmd: ":",
      },
    };

    expect(getUpdatedCiConfig(input, projectStructure)).resolves.toEqual(
      expected
    );
  });
});
