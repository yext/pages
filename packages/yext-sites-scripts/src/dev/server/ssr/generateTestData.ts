import { spawn } from "child_process";
import {
  CLI_BOILERPLATE_CHUNK_BEGIN,
  STREAM_DATA_CHUNK_BEGIN,
} from "./constants";

type ParentProcess = {
  stdin: NodeJS.ReadStream;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
};

export const generateTestData = async (
  parentProcess: ParentProcess,
  featureConfig: any,
  entityId: string
): Promise<any> => {
  return new Promise((resolve) => {
    let testData = "";

    const childProcess = spawn(
      "yext",
      [
        "sites",
        "generate-test-data",
        "--featureName",
        `'${featureConfig?.features[0]?.name}'`,
        "--entityId",
        entityId,
        "--featuresConfig",
        `'${JSON.stringify(featureConfig)}'`,
        "--locale",
        "en",
        "--printDocuments",
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      }
    );

    // Read the child process' stdout and stderr streams as UTF-8 encoded strings.
    childProcess.stdout.setEncoding("utf8");
    childProcess.stderr.setEncoding("utf8");

    // Pipe input from the parent process to the generateTestDataChildProcess so the
    // user can respond to any interactive prompts (i.e. auth flow) from the parent
    // process.
    parentProcess.stdin.pipe(childProcess.stdin);

    // When the child process receives a chunk of data on stdout, redirect it to the
    // appropriate place.
    childProcess.stdout.on("data", (chunk) => {
      // If the chunk is actual stream data, write to local variable.
      if (chunk.startsWith(STREAM_DATA_CHUNK_BEGIN)) {
        testData += chunk;
      }
      // If the chunk is CLI Boilerplate, ignore.
      else if (chunk.startsWith(CLI_BOILERPLATE_CHUNK_BEGIN)) {
        return;
      }
      // This case will act as a catch-all to write back any prompts to the user to
      // the parent process. It's main usage is to allow the user to go through the
      // authentication flow from the parent process.
      else {
        parentProcess.stdout.write(chunk);
      }
    });

    // Write back anything on stderr to the parent process so the user can see and respond.
    childProcess.stderr.on("data", (chunk) => {
      parentProcess.stderr.write(chunk);
    });

    // When the stream is closed, resolve with the testData we've collected.
    childProcess.on("close", () => {
      if (testData) {
        testData = JSON.parse(testData.trim());
      }

      resolve(testData);
    });
  });
};
