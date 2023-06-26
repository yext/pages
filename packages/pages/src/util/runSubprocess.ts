import { spawn } from "child_process";
import process from "process";

/**
 * Creates a child process and writes to stdout and stderr in real time
 * @param {String} command the CLI command to run
 * @param {ReadonlyArray<string>} args the CLI arguments
 * @return {Promise<number>} the process's exit code
 */
function runSubProcess(command: string, args: ReadonlyArray<string>) {
  process.stdout.write("> " + command + " " + args.join(" ") + "\n");
  const childProcess = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });
  return new Promise((resolveFunc) => {
    childProcess.stdout.on("data", (x) => {
      process.stdout.write(x.toString());
    });
    childProcess.stderr.on("data", (x) => {
      process.stderr.write(x.toString());
    });
    childProcess.on("exit", (code) => {
      resolveFunc(code);
    });
  });
}

export default runSubProcess;
