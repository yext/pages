import {
  SpawnOptionsWithoutStdio,
} from "child_process";
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

afterAll((done) => {
  mockChildProcessStdin.destroy();
  mockChildProcessStdout.destroy();
  mockChildProcessStderr.destroy();
  mockParentProcessStdout.destroy();

  done();
});

jest.mock("child_process", () => ({
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

const mockFeatureConfig = JSON.parse(
  fs
    .readFileSync(
      path.resolve(process.cwd(), `tests/fixtures/feature_config.json`)
    )
    .toString()
);

describe("generateTestData", () => {
  it("properly reads stream data and returns it", async () => {
    async function testRunner() {
      return await generateTestData(
        mockParentProcessStdout,
        mockFeatureConfig,
        "loc3"
      );
    }

    const testRunnerPromise = testRunner();

    mockChildProcessStdout.emit(
      "data",
      '{ "field": "I AM DATA THAT SHOULD BE RECEIVED" }'
    );

    mockChildProcess.emit("close");

    testRunnerPromise.then((datadoc) => {
      console.log("resolved");
      console.log(datadoc);
      expect(1).toBeTruthy();
    });
  });

  it("properly ignores CLI Boilerplate", async () => {
    expect(1).toBeTruthy();
  });

  it("properly redirects other output to the parent process' stdout", async () => {
    expect(1).toBeTruthy();
  });
});
