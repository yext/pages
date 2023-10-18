import { execSync } from "child_process";

function checkInstalled(command: string): void {
  if (command.includes("yext")) {
    try {
      execSync("yext version");
    } catch (ignored) {
      throw new Error(
        "Yext CLI is not installed. Please install by " +
          "following the instructions here: " +
          "https://hitchhikers.yext.com/docs/cli/installation/installation/"
      );
    }
  }
}

export default checkInstalled;
