export interface GenerationInfo {
  startStep(step: string): void;
  runCommand(command: string): Promise<number>;
}

// Files to remove from the cloned repo
const filesToFilter = ["LICENSE", "THIRD-PARTY-NOTICES", ".github/"];

export async function generate(info: GenerationInfo) {
  info.startStep("Copying files");
  const gitCloneExitCode = await info.runCommand(
    // swap back to this once the repo goes live
    // "git clone https://github.com/yext/site-starter-react-basic.git ."
    "git clone git@github.com:yext/site-starter-react-basic.git ."
  );
  if (gitCloneExitCode) {
    throw new Error(
      "git clone returned a non-zero exit code " + gitCloneExitCode
    );
  }

  // Remove files the user shouldn't need
  info.startStep("Cleaning up");
  const cmdExitCode = await info.runCommand(
    `rm -rf ${filesToFilter.join(
      " "
    )} && sed '/"license": "BSD-3-Clause",/d' package.json`
  );
  if (cmdExitCode) {
    throw new Error("error cleaning up files " + cmdExitCode);
  }

  info.startStep("Installing dependencies (this may take a while)");
  const npmExitCode = await info.runCommand("npm install");
  if (npmExitCode) {
    throw new Error("npm install returned a non-zero exit code " + npmExitCode);
  }

  info.startStep("Running first build");
  const buildExitCode = await info.runCommand("npm run build");
  if (buildExitCode) {
    throw new Error("failed to build " + buildExitCode);
  }
}
