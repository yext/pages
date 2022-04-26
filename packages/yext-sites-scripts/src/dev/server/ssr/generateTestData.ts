import { spawn } from "child_process";
import {
  CLI_BOILERPLATE_CHUNK_BEGIN,
  STREAM_DATA_CHUNK_BEGIN,
} from "./constants";

export const generateTestData = async (
  featureConfig: any,
  entityId: string
): Promise<string> => {
  return new Promise((resolve) => {
    let testData = "";

    // spawn a child process that will call generate-test-data via the
    // CLI for the relevant entity and print the output directly to stdout.
    const generateTestDataChildProcess = spawn(
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
    generateTestDataChildProcess.stdout.setEncoding("utf8");
    generateTestDataChildProcess.stderr.setEncoding("utf8");

    // Pipe input from the parent process to the generateTestDataChildProcess so the
    // user can respond to any interactive prompts (i.e. auth flow) from the parent
    // process.
    process.stdin.pipe(generateTestDataChildProcess.stdin);

    // When the child process receives a chunk of data on stdout, redirect it to the
    // appropriate place.
    generateTestDataChildProcess.stdout.on("data", (chunk) => {
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
        process.stdout.write(chunk);
      }
    });

    // Write back anything on stderr to the parent process so the user can see and respond.
    generateTestDataChildProcess.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    // When the stream is closed, resolve with the testData we've collected.
    generateTestDataChildProcess.on("close", () => {
      if (testData) {
        testData = JSON.parse(testData.trim());
      }

      resolve(testData);
    });
  });
};
