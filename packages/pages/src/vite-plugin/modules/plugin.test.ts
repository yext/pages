import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectStructure } from "../../common/src/project/structure.js";

const buildMock = vi.hoisted(() => vi.fn());
const mergeConfigMock = vi.hoisted(() => vi.fn((a, b) => ({ ...a, ...b })));
const globSyncMock = vi.hoisted(() => vi.fn());
const getModuleNameMock = vi.hoisted(() => vi.fn());
const scopedViteConfigPathMock = vi.hoisted(() => vi.fn(() => undefined));
const logWarningMock = vi.hoisted(() => vi.fn());
const existsSyncMock = vi.hoisted(() => vi.fn(() => true));

vi.mock("vite", () => ({
  build: buildMock,
  mergeConfig: mergeConfigMock,
}));

vi.mock("glob", () => ({
  glob: {
    sync: globSyncMock,
  },
}));

vi.mock("../../common/src/module/internal/getModuleConfig.js", () => ({
  getModuleName: getModuleNameMock,
}));

vi.mock("../../util/viteConfig.js", () => ({
  scopedViteConfigPath: scopedViteConfigPathMock,
}));

vi.mock("../../util/processEnvVariables.js", () => ({
  processEnvVariables: () => ({}),
}));

vi.mock("../../common/src/module/internal/logger.js", () => ({
  createModuleLogger: () => ({ info: vi.fn() }),
}));

vi.mock("vite-plugin-node-polyfills", () => ({
  nodePolyfills: () => ({ name: "mock-polyfill-plugin" }),
}));

vi.mock("../../util/logError.js", () => ({
  logWarning: logWarningMock,
  logErrorAndExit: (error: string) => {
    throw new Error(error);
  },
}));

vi.mock("node:fs", () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: vi.fn(() => ""),
  },
}));

describe("buildModules duplicate and collision handling", () => {
  beforeEach(() => {
    buildMock.mockReset();
    buildMock.mockResolvedValue(undefined);
    mergeConfigMock.mockClear();
    globSyncMock.mockReset();
    getModuleNameMock.mockReset();
    scopedViteConfigPathMock.mockReset();
    scopedViteConfigPathMock.mockReturnValue(undefined);
    logWarningMock.mockReset();
    existsSyncMock.mockReset();
    existsSyncMock.mockReturnValue(true);
  });

  it("keeps scoped module when scoped and unscoped names are the same", async () => {
    const scopedModule = "/repo/src/modules/brand/widget/index.tsx";
    const unscopedModule = "/repo/src/modules/widget/index.tsx";

    globSyncMock.mockImplementation((pattern: string) => {
      if (pattern.includes("/brand/*/*.{jsx,tsx}")) {
        return [scopedModule];
      }
      if (pattern.includes("/modules/*/*.{jsx,tsx}")) {
        return [unscopedModule];
      }
      return [];
    });

    getModuleNameMock.mockReturnValue("SharedWidget");

    const { buildModules } = await import("./plugin.js");
    const projectStructure = new ProjectStructure({ scope: "brand" });
    await buildModules(projectStructure);

    expect(buildMock).toHaveBeenCalledTimes(1);
    const buildArg = buildMock.mock.calls[0][0];
    expect(buildArg.build.rollupOptions.input).toEqual(scopedModule);
    expect(buildArg.build.rollupOptions.output.entryFileNames).toEqual("SharedWidget.umd.js");
  });

  it("throws when duplicate module names exist in the same scope", async () => {
    globSyncMock.mockImplementation((pattern: string) => {
      if (pattern.includes("/brand/*/*.{jsx,tsx}")) {
        return ["/repo/src/modules/brand/a/first.tsx", "/repo/src/modules/brand/b/second.tsx"];
      }
      if (pattern.includes("/modules/*/*.{jsx,tsx}")) {
        return [];
      }
      return [];
    });

    getModuleNameMock.mockReturnValue("DuplicateName");

    const { buildModules } = await import("./plugin.js");
    const projectStructure = new ProjectStructure({ scope: "brand" });

    await expect(buildModules(projectStructure)).rejects.toThrowError(
      'Duplicate module name "DuplicateName" found in:'
    );
    expect(buildMock).not.toHaveBeenCalled();
  });

  it("throws when distinct module names sanitize to the same output filename", async () => {
    globSyncMock.mockImplementation((pattern: string) => {
      if (pattern.includes("/modules/*/*.{jsx,tsx}")) {
        return ["/repo/src/modules/a/first.tsx", "/repo/src/modules/b/second.tsx"];
      }
      return [];
    });

    getModuleNameMock.mockReturnValueOnce("foo/bar").mockReturnValueOnce("foo-bar");

    const { buildModules } = await import("./plugin.js");
    const projectStructure = new ProjectStructure();

    await expect(buildModules(projectStructure)).rejects.toThrowError(
      'resolve to the same output filename "foo-bar.umd.js"'
    );
    expect(buildMock).not.toHaveBeenCalled();
  });
});
