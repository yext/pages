/**
 * @jest-environment jsdom
 */
import { getRuntime } from "./runtime";

describe("runtime", () => {
  it("correctly identifies node and it's major version", async () => {
    const originalProcess = process;
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
    const runtime = getRuntime();

    expect(runtime.name).toEqual("node");
    expect(runtime.version).toEqual("16.16.0");
    expect(runtime.getNodeMajorVersion()).toEqual(16);

    global.process = originalProcess;
  });

  it("returns true for isServerSide when the runtime is node.", async () => {
    const originalProcess = process;
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
    const runtime = getRuntime();

    expect(runtime.isServerSide).toBe(true);
    global.process = originalProcess;
  });

  it("correctly identifies deno via Deno object", async () => {
    const originalProcess = process;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.process = undefined;

    const originalWindow = { ...window };
    const windowSpy = jest.spyOn(global, "window", "get");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    windowSpy.mockImplementation(() => ({
      ...originalWindow,
      Deno: {
        version: {
          deno: "1.24.0",
        },
      },
    }));

    const runtime = getRuntime();

    expect(runtime.name).toEqual("deno");
    expect(runtime.version).toEqual("1.24.0");

    global.process = originalProcess;
    windowSpy.mockRestore();
  });

  it("correctly identifies deno via lack of window object", async () => {
    const originalProcess = process;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.process = undefined;

    const windowSpy = jest.spyOn(global, "window", "get");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    windowSpy.mockImplementation(() => undefined);

    const runtime = getRuntime();

    expect(runtime.name).toEqual("deno");
    expect(runtime.version).toEqual("");

    global.process = originalProcess;
    windowSpy.mockRestore();
  });

  it("returns true for isServerSide when runtime is deno", async () => {
    const originalProcess = process;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.process = undefined;

    const originalWindow = { ...window };
    const windowSpy = jest.spyOn(global, "window", "get");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    windowSpy.mockImplementation(() => ({
      ...originalWindow,
      Deno: {
        version: {
          deno: "1.24.0",
        },
      },
    }));

    const runtime = getRuntime();
    expect(runtime.isServerSide).toBe(true);

    global.process = originalProcess;
    windowSpy.mockRestore();
  });

  it("getNodeMajorVersion() throws when not node", async () => {
    const originalProcess = process;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.process = undefined;

    const originalWindow = { ...window };
    const windowSpy = jest.spyOn(global, "window", "get");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    windowSpy.mockImplementation(() => ({
      ...originalWindow,
      Deno: {
        version: {
          deno: "1.24.0",
        },
      },
    }));

    const runtime = getRuntime();

    expect(() => runtime.getNodeMajorVersion()).toThrow();

    global.process = originalProcess;
    windowSpy.mockRestore();
  });

  it("correctly identifies browser", async () => {
    const originalProcess = process;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.process = undefined;

    const runtime = getRuntime();

    expect(runtime.name).toEqual("browser");

    global.process = originalProcess;
  });

  it("returns false for isServerSide when runtime is browser", async () => {
    const originalProcess = process;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.process = undefined;

    const runtime = getRuntime();

    expect(runtime.isServerSide).toBe(false);

    global.process = originalProcess;
  });
});
