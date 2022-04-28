import { SpawnOptionsWithoutStdio } from "child_process";
import { ReadStream, WriteStream } from "tty";
import { generateTestData } from "../../../src/dev/server/ssr/generateTestData";
import { EventEmitter } from "stream";
import { CLI_BOILERPLATE } from "../../fixtures/cli_boilerplate";
import { CLI_STREAM_DATA } from "../../fixtures/cli_stream_data";
import { FEATURE_CONFIG } from "../../fixtures/feature_config";

let mockParentProcessStdout = new WriteStream(0);

let mockChildProcessEventEmitter = new EventEmitter();

let mockChildProcess = {
  stdin: new WriteStream(0),
  stdout: new ReadStream(1),
  stderr: new ReadStream(2),
  on: mockChildProcessEventEmitter.on,
  emit: mockChildProcessEventEmitter.emit,
};

afterEach(() => {
  // after each unit test, destroy the streams associated with the previous
  // and create fresh ones.
  mockChildProcess.stdin.destroy();
  mockChildProcess.stdout.destroy();
  mockChildProcess.stderr.destroy();
  mockParentProcessStdout.destroy();

  // stale listeners from previous runs must be removed each test.
  mockChildProcessEventEmitter.removeAllListeners();

  mockChildProcess = {
    stdin: new WriteStream(0),
    stdout: new ReadStream(1),
    stderr: new ReadStream(2),
    // The on and emit functions must be explicitly re-assigned after the stale
    // listeners have been removed before each run.
    on: mockChildProcessEventEmitter.on,
    emit: mockChildProcessEventEmitter.emit,
  };

  mockParentProcessStdout = new WriteStream(0);
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

const getGenerateTestDataRunner = () => {
  return generateTestData(mockParentProcessStdout, FEATURE_CONFIG, "loc3");
};

describe("generateTestData", () => {
  it("properly reads stream data from stdout and returns it as parsed JSON", async () => {
    const testRunnerPromise = getGenerateTestDataRunner();

    mockChildProcess.stdout.emit("data", `${JSON.stringify(CLI_STREAM_DATA)}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // There is no unrecognized data, so nothing should be written back to the parent process.
    expect(mockParentProcessStdout.bytesWritten).toBeFalsy();
  });

  it("properly ignores CLI Boilerplate when parsing stream data", async () => {
    const testRunnerPromise = getGenerateTestDataRunner();

    mockChildProcess.stdout.emit("data", `${CLI_BOILERPLATE}`);
    mockChildProcess.stdout.emit("data", `${JSON.stringify(CLI_STREAM_DATA)}`);
    mockChildProcess.stdout.emit("data", `${CLI_BOILERPLATE}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // There is no unrecognized data, so nothing should be written back to the parent process.
    expect(mockParentProcessStdout.bytesWritten).toBeFalsy();
  });

  it("properly redirects other output to the parent process' stdout", async () => {
    const testRunnerPromise = getGenerateTestDataRunner();

    const unrecognizedData = "I am unrecognized data";

    mockChildProcess.stdout.emit("data", `${CLI_BOILERPLATE}`);
    mockChildProcess.stdout.emit("data", `${JSON.stringify(CLI_STREAM_DATA)}`);
    mockChildProcess.stdout.emit("data", `${unrecognizedData}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // There is unrecognized data, make sure we write back the expected message to the parent process.
    expect(mockParentProcessStdout.bytesWritten).toEqual(
      new TextEncoder().encode(unrecognizedData).length
    );
  });
});
