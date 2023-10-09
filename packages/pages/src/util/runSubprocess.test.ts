import runSubprocess from "./runSubprocess.js";

describe("runSubprocess", () => {
  it("runs echo successfully", async () => {
    const exitCode = await runSubprocess("echo", ["123"]);
    expect(exitCode).toEqual(0);
  });

  it("returns non-zero when subprocess fails", async () => {
    if (process.platform === "win32") {
      const exitCode = await runSubprocess("powershell.exe", ["0/0"]);
      expect(exitCode).not.toEqual(0);
    } else {
      const exitCode = await runSubprocess("echo", ["$((0/0))"]);
      expect(exitCode).not.toEqual(0);
    }
  });
});
