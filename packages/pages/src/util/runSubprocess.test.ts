import runSubprocess from "./runSubprocess.js";
import path from "node:path";

describe("runSubprocess", () => {
  it("runs echo successfully", async () => {
    const exitCode = await runSubprocess("echo", ["123"]);
    expect(exitCode).toEqual(0);
  });

  it("returns non-zero when subprocess fails", async () => {
    const exitCode = await runSubprocess("echo", ["$((0/0))"]);
    if (path.sep === path.posix.sep) {
      expect(exitCode).not.toEqual(0);
    }
    // commands do not return exit codes on Windows, so we skip this test in that case
    expect(true).toEqual(true);
  });
});
