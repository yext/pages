import { CiConfig } from "../../common/src/ci/ci.js";
import { getUpdatedCiConfig } from "./ci.js";

describe("ci - getUpdatedCiConfig", () => {
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
        ],
        features: "sites-config/features.json",
        plugins: [
          {
            pluginName: "Pages Generator",
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

    expect(getUpdatedCiConfig(input)).toEqual(expected);
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
        ],
        features: "sites-config/features.json",
        plugins: [
          {
            pluginName: "Pages Generator",
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

    expect(getUpdatedCiConfig(input)).toEqual(expected);
  });
});