/**
 * @jest-environment jsdom
 */
import * as browserOrNode from "browser-or-node";
import { getRuntime } from "./runtime.js";

jest.mock("browser-or-node", () => ({
  __esModule: true,
  isNode: false,
  isDeno: false,
  isBrowser: true,
}));

declare global {
  // eslint-disable-next-line no-var
  var Deno:
    | {
        version: {
          deno: string;
        };
      }
    | undefined;
}

const originalProcess = process;

describe("runtime", () => {
  afterEach(() => {
    (browserOrNode.isDeno as any) = false;
    (browserOrNode.isNode as any) = false;
    global.process = originalProcess;
    global.Deno = undefined;
  });

  it("correctly identifies node and it's major version", async () => {
    setupMockEnvironment("node");

    const runtime = getRuntime();

    expect(runtime.name).toEqual("node");
    expect(runtime.version).toEqual("16.16.0");
    expect(runtime.getNodeMajorVersion()).toEqual(16);
  });

  it("returns true for isServerSide when the runtime is node.", async () => {
    setupMockEnvironment("node");

    const runtime = getRuntime();

    expect(runtime.isServerSide).toBe(true);
  });

  it("correctly identifies deno via Deno object", async () => {
    setupMockEnvironment("deno");

    const runtime = getRuntime();

    expect(runtime.name).toEqual("deno");
    expect(runtime.version).toEqual("1.24.0");
  });

  it("returns true for isServerSide when runtime is deno", async () => {
    setupMockEnvironment("deno");

    const runtime = getRuntime();
    expect(runtime.isServerSide).toBe(true);
  });

  it("getNodeMajorVersion() throws when not node", async () => {
    setupMockEnvironment("deno");

    const runtime = getRuntime();

    expect(() => runtime.getNodeMajorVersion()).toThrow();
  });

  it("correctly identifies browser", async () => {
    setupMockEnvironment();

    const runtime = getRuntime();

    expect(runtime.name).toEqual("browser");
  });

  it("returns false for isServerSide when runtime is browser", async () => {
    setupMockEnvironment();

    const runtime = getRuntime();

    expect(runtime.isServerSide).toBe(false);
  });
});

const setupMockEnvironment = (simulatedEnvironment?: "node" | "deno") => {
  const originalProcess = process;
  (global.process as any) = undefined;

  if (simulatedEnvironment === "deno") {
    (browserOrNode.isDeno as any) = true;
    global.Deno = {
      version: {
        deno: "1.24.0",
      },
    };
  }

  if (simulatedEnvironment === "node") {
    (browserOrNode.isNode as any) = true;
    global.process = {
      ...originalProcess,
      versions: {
        http_parser: "foo",
        node: "16.16.0",
        v8: "foo",
        ares: "foo",
        uv: "foo",
        zlib: "foo",
        modules: "foo",
        openssl: "foo",
      },
    };
  }
};
