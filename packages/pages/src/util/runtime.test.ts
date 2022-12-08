/**
 * @jest-environment jsdom
 */
import * as browserOrNode from "browser-or-node";
import { getRuntime } from "./runtime.js";

jest.mock("browser-or-node", () => ({
  __esModule: true,
  isNode: false,
  isDeno: true,
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

describe("runtime", () => {
  it("correctly identifies node and it's major version", async () => {
    const originalProcess = setupMockEnvironment("node");

    const runtime = getRuntime();

    expect(runtime.name).toEqual("node");
    expect(runtime.version).toEqual("16.16.0");
    expect(runtime.getNodeMajorVersion()).toEqual(16);

    global.process = originalProcess;
  });

  it("returns true for isServerSide when the runtime is node.", async () => {
    const originalProcess = setupMockEnvironment("node");

    const runtime = getRuntime();

    expect(runtime.isServerSide).toBe(true);

    global.process = originalProcess;
  });

  it("correctly identifies deno via Deno object", async () => {
    const originalProcess = setupMockEnvironment("deno");

    const runtime = getRuntime();

    expect(runtime.name).toEqual("deno");
    expect(runtime.version).toEqual("1.24.0");

    global.process = originalProcess;
    global.Deno = undefined;
  });

  it("returns true for isServerSide when runtime is deno", async () => {
    const originalProcess = setupMockEnvironment("deno");

    const runtime = getRuntime();
    expect(runtime.isServerSide).toBe(true);

    global.process = originalProcess;
    global.Deno = undefined;
  });

  it("getNodeMajorVersion() throws when not node", async () => {
    const originalProcess = setupMockEnvironment("deno");

    const runtime = getRuntime();

    expect(() => runtime.getNodeMajorVersion()).toThrow();

    global.process = originalProcess;
  });

  it("correctly identifies browser", async () => {
    const originalProcess = setupMockEnvironment();

    const runtime = getRuntime();

    expect(runtime.name).toEqual("browser");

    global.process = originalProcess;
  });

  it("returns false for isServerSide when runtime is browser", async () => {
    const originalProcess = setupMockEnvironment();

    const runtime = getRuntime();

    expect(runtime.isServerSide).toBe(false);

    global.process = originalProcess;
  });
});

const setupMockEnvironment = (
  simulatedEnvironment?: "node" | "deno"
): NodeJS.Process => {
  const originalProcess = process;
  (global.process as any) = undefined;

  if (simulatedEnvironment === "deno") {
    global.Deno = {
      version: {
        deno: "1.24.0",
      },
    };
    (browserOrNode.isDeno as any) = true;
    (browserOrNode.isNode as any) = false;
  }

  if (simulatedEnvironment === "node") {
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
    (browserOrNode.isDeno as any) = false;
    (browserOrNode.isNode as any) = true;
  }

  if (!simulatedEnvironment) {
    (browserOrNode.isDeno as any) = false;
    (browserOrNode.isNode as any) = false;
  }

  return originalProcess;
};
