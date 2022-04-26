import {
  SpawnOptionsWithoutStdio,
  ChildProcess,
  ChildProcessWithoutNullStreams,
  spawn,
} from "child_process";
import path from "path";
import { ReadStream, WriteStream } from "tty";
import fs from "fs";
import { generateTestData } from "../../../src/dev/server/ssr/generateTestData";
import { Readable, Writable } from "stream";

jest.mock("child_process", () => ({
  ...(jest.requireActual("child_process") as object),
  spawn: jest.fn(
    (
      command: string,
      args?: readonly string[] | undefined,
      options?: SpawnOptionsWithoutStdio | undefined
    ): ChildProcessWithoutNullStreams => {
      console.log("I called my mock func");
      return {
        stdin: new Writable,
        stdout: new Readable,
        stderr: new Readable,
        channel: undefined,
        stdio: [new Writable, new Readable, new Readable, new Readable, new Readable],
        killed: false,
        pid: undefined,
        connected: true,
        exitCode: null,
        signalCode: null,
        spawnargs: [],
        spawnfile: "",
        kill: (signal?) => {return false},
        send: (message, callback?) => {return false},
        disconnect: () => {},
        unref: () => {},
        ref: () => {},
        emit: (event) => {return true},
        // TODO - how do you mock a return type of this, pretty much everything below here?
        addListener: (eventName, func) => {return new EventEmitter},
        on: (event, func) => {return new EventEmitter},
        once: (event, func) => {return ref},
        prependListener: (event, func) => {return ref},
        removeListener: (event, func) => {return ref},
        removeAllListeners: (event) => {return ref},
        prependOnceListener: (event, func) => {return ref},
        setMaxListeners: (num) => {return ref},
        off: (event, func) => {return ref},
        getMaxListeners: () => {return 5},
        listeners: (event) => {return [() => {}]},
        rawListeners: (event) => {return [() => {}]},
        listenerCount: (event) => {return 5},
        eventNames: () => {return []},
      };
    }
  ),
}));

const mockFeatureConfig = JSON.parse(
  fs
    .readFileSync(
      path.resolve(process.cwd(), `tests/fixtures/feature_config.json`)
    )
    .toString()
);

describe("generateTestData", () => {
  it("properly spawns a child process", async () => {
    const mockParentProcessStdin = new ReadStream(0);
    const mockParentProcessStdout = new WriteStream(1);
    const mockParentProcessStderr = new WriteStream(2);

    const dataDoc = await generateTestData(
      {
        stdin: mockParentProcessStdin,
        stdout: mockParentProcessStdout,
        stderr: mockParentProcessStderr,
      },
      mockFeatureConfig,
      "loc3"
    );

    expect(spawn).toBeCalledWith();

    expect(1).toBeTruthy();
  });

  it("properly redirects the stdout of the child process", async () => {
    expect(1).toBeTruthy();
  });

  it("properly redirects the stderr of the child process", async () => {
    expect(1).toBeTruthy();
  });

  it("propoerly pipes input from parent to child process", async () => {
    expect(1).toBeTruthy();
  });
});
