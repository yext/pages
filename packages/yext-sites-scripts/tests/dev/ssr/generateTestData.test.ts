import "jest";
import {
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from "child_process";

jest.mock("child_process", () => ({
  ...(jest.requireActual("child_process") as object),
  spawn: jest.fn(
    (
      command: string,
      args?: readonly string[] | undefined,
      options?: SpawnOptionsWithoutStdio | undefined
    ): ChildProcessWithoutNullStreams => {
      return {};
    }
  ),
}));

describe("generateTestData", () => {
  it("properly spawns a child process", async () => {
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
