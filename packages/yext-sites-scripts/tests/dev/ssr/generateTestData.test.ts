import { SpawnOptionsWithoutStdio } from "child_process";
import path from "path";
import { ReadStream, WriteStream } from "tty";
import fs from "fs";
import { generateTestData } from "../../../src/dev/server/ssr/generateTestData";
import { EventEmitter } from "stream";

let mockChildProcessStdin = new WriteStream(0);
let mockChildProcessStdout = new ReadStream(1);
let mockChildProcessStderr = new ReadStream(2);
let mockParentProcessStdout = new WriteStream(0);

let mockChildProcessEventEmitter = new EventEmitter();
let mockChildProcess = {
  stdin: mockChildProcessStdin,
  stdout: mockChildProcessStdout,
  stderr: mockChildProcessStderr,
  on: mockChildProcessEventEmitter.on,
  emit: mockChildProcessEventEmitter.emit,
};

beforeEach((done) => {
  // before each unit test, destroy the streams associated with the previous
  // and create fresh ones.
  mockChildProcessStdin.destroy();
  mockChildProcessStdout.destroy();
  mockChildProcessStderr.destroy();
  mockParentProcessStdout.destroy();

  mockChildProcessStdin = new WriteStream(0);
  mockChildProcessStdout = new ReadStream(1);
  mockChildProcessStderr = new ReadStream(2);
  mockParentProcessStdout = new WriteStream(0);

  // stale listeners from previous runs must be removed each test.
  mockChildProcessEventEmitter.removeAllListeners();

  mockChildProcess = {
    stdin: mockChildProcessStdin,
    stdout: mockChildProcessStdout,
    stderr: mockChildProcessStderr,
    // The on and emit functions must be explicitly re-assigned after the stale
    // listeners have been removed before each run.
    on: mockChildProcessEventEmitter.on,
    emit: mockChildProcessEventEmitter.emit,
  };

  done();
});

afterAll((done) => {
  // after all tests, fully release any internal resources held by the streams.
  mockChildProcessStdin.destroy();
  mockChildProcessStdout.destroy();
  mockChildProcessStderr.destroy();
  mockParentProcessStdout.destroy();

  done();
});

jest.mock("child_process", () => ({
  // this pattern allows us to only override the method we want to mock in the
  // child_process module while leaving the rest of the module's functionality intact.
  ...(jest.requireActual("child_process") as object),
  spawn: jest.fn(
    (
      command: string,
      args?: readonly string[] | undefined,
      options?: SpawnOptionsWithoutStdio | undefined
    ): any => {
      return mockChildProcess;
    }
  ),
}));

const featureConfigString = fs
  .readFileSync(
    path.resolve(process.cwd(), `tests/fixtures/feature_config.json`)
  )
  .toString();

const streamDataString = fs
  .readFileSync(
    path.resolve(process.cwd(), `tests/fixtures/cli_stream_data.json`)
  )
  .toString();

const cliBoilerplateString = fs
  .readFileSync(
    path.resolve(process.cwd(), `tests/fixtures/cli_boilerplate.txt`)
  )
  .toString();

const getGenerateTestDataRunner = () => {
  return async () => {
    return await generateTestData(
      mockParentProcessStdout,
      JSON.parse(featureConfigString),
      "loc3"
    );
  };
};

describe("generateTestData", () => {
  it("properly reads stream data from stdout and returns it as parsed JSON", async () => {
    const testRunnerPromise = getGenerateTestDataRunner()();

    mockChildProcessStdout.emit("data", `${streamDataString}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(JSON.parse(streamDataString));
    // There is no unrecognized data, so nothing should be written back to the parent process.
    expect(mockParentProcessStdout.bytesWritten).toBeFalsy();
  });

  it("properly ignores CLI Boilerplate when parsing stream data", async () => {
    const testRunnerPromise = getGenerateTestDataRunner()();

    mockChildProcessStdout.emit("data", `${cliBoilerplateString}`);
    mockChildProcessStdout.emit("data", `${streamDataString}`);
    mockChildProcessStdout.emit("data", `${cliBoilerplateString}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(JSON.parse(streamDataString));
     // There is no unrecognized data, so nothing should be written back to the parent process.
    expect(mockParentProcessStdout.bytesWritten).toBeFalsy();
  });

  it("properly redirects other output to the parent process' stdout", async () => {
    const testRunnerPromise = getGenerateTestDataRunner()();

    const unrecognizedData = "I am unrecognized data";

    mockChildProcessStdout.emit("data", `${cliBoilerplateString}`);
    mockChildProcessStdout.emit("data", `${streamDataString}`);
    mockChildProcessStdout.emit("data", `${unrecognizedData}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(JSON.parse(streamDataString));
     // There is unrecognized data, make sure we write back the expected message to the parent process.
    expect(mockParentProcessStdout.bytesWritten).toEqual(
      new TextEncoder().encode(unrecognizedData).length
    );
  });
});
