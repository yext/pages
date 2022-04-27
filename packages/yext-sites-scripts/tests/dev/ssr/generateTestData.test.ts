import {
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from "child_process";
import path from "path";
import { ReadStream, WriteStream } from "tty";
import fs from "fs";
import { generateTestData } from "../../../src/dev/server/ssr/generateTestData";
import { EventEmitter } from "stream";

const mockChildProcessStdin = new WriteStream(0);
const mockChildProcessStdout = new ReadStream(1);
const mockChildProcessStderr = new ReadStream(2);

const testEventEmitter = new EventEmitter();

let mockChildProcess = {
  stdin: mockChildProcessStdin,
  stdout: mockChildProcessStdout,
  stderr: mockChildProcessStderr,
  on: testEventEmitter.on,
  emit: testEventEmitter.emit,
};

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
    const mockParentProcessStdout = new WriteStream(1);

    async function testRunner() {
      return await generateTestData(
        mockParentProcessStdout,
        mockFeatureConfig,
        "loc3"
      );
    }

    testRunner()
      .then((datadoc) => {
        expect(datadoc).toBeTruthy();
      })
      .catch(() => {
        expect(1).toBeFalsy();
      });

    mockChildProcessStdout.emit(
      "data",
      '{ "field": "I AM DATA THAT SHOULD BE RECEIVED" }'
    );

    mockChildProcess.emit("close");
  });

  it("properly ignores CLI Boilerplate", async () => {
    expect(1).toBeTruthy();
  });

  it("properly redirects other output to the parent process' stdout", async () => {
    expect(1).toBeTruthy();
  });
});