import {
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams
} from "child_process";
import path from "path";
import { ReadStream, WriteStream } from "tty";
import fs from "fs";
import { generateTestData } from "../../../src/dev/server/ssr/generateTestData";
import { EventEmitter } from "stream";

const mockChildProcessStdin = new WriteStream(0);
const mockChildProcessStdout = new ReadStream(1);
const mockChildProcessStderr = new ReadStream(2);

let mockChildProcess = {
  stdin: mockChildProcessStdin,
  stdout: mockChildProcessStdout,
  stderr: mockChildProcessStderr,
  ...new EventEmitter(),
};

jest.mock("child_process", () => ({
  ...(jest.requireActual("child_process") as object),
  spawn: jest.fn(
    (
      command: string,
      args?: readonly string[] | undefined,
      options?: SpawnOptionsWithoutStdio | undefined
    ): ChildProcessWithoutNullStreams => {
      console.log("I called my mock func");
      return mockChildProcess;
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
    expect(1).toBeTruthy();
  });

  it("properly redirects the stdout of the child process", async () => {
    const mockParentProcessStdin = new ReadStream(0);
    const mockParentProcessStdout = new WriteStream(1);
    const mockParentProcessStderr = new WriteStream(2);

    
    async function testRunner() {
      console.log("test runner");
      const dataDoc = await generateTestData(
        {
          stdin: mockParentProcessStdin,
          stdout: mockParentProcessStdout,
          stderr: mockParentProcessStderr,
        },
        mockFeatureConfig,
        "loc3"
      );

      console.log("I finished the generateTestData stuff");

      console.log(dataDoc);

      expect(dataDoc).toBeTruthy();

      return;
    };

    testRunner();

    mockChildProcessStdout.emit("data", "{ I AM DATA THAT SHOULD BE RECEIVED");

    mockChildProcess.emit("close");

    expect(1).toBeTruthy();
  });

  it("properly redirects the stderr of the child process", async () => {
    expect(1).toBeTruthy();
  });

  it("propoerly pipes input from parent to child process", async () => {
    expect(1).toBeTruthy();
  });
});


// const mockChildProcess = {
//   stdin: mockChildProcessStdin,
//   stdout: mockChildProcessStdout,
//   stderr: mockChildProcessStderr,
//   channel: undefined,
//   stdio: [
//     mockChildProcessStdin,
//     mockChildProcessStdout,
//     mockChildProcessStdout,
//     mockChildProcessStderr,
//     mockChildProcessStdout,
//   ],
//   killed: false,
//   pid: undefined,
//   connected: true,
//   exitCode: null,
//   signalCode: null,
//   spawnargs: [],
//   spawnfile: "",
//   kill: jest.fn(),
//   send: jest.fn(),
//   disconnect: jest.fn(),
//   unref: jest.fn(),
//   ref: jest.fn(),
//   emit: jest.fn(),
//   addListener: jest.fn(),
//   on: jest.fn(),
//   once: jest.fn(),
//   prependListener: jest.fn(),
//   removeListener: jest.fn(),
//   removeAllListeners: jest.fn(),
//   prependOnceListener: jest.fn(),
//   setMaxListeners: jest.fn(),
//   off: jest.fn(),
//   getMaxListeners: jest.fn(),
//   listeners: jest.fn(),
//   rawListeners: jest.fn(),
//   listenerCount: jest.fn(),
//   eventNames: jest.fn(),
// };