import { spawn } from "child_process";
import {
  CLI_BOILERPLATE_CHUNK_BEGIN,
  STREAM_DATA_CHUNK_BEGIN,
} from "./constants";

export const generateTestData = async (
  stdout: NodeJS.WriteStream,
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
        stdio: ["inherit", "pipe", "inherit"],
        shell: true,
      }
    );

    childProcess.stdout.on("data", (chunkBuff: Buffer) => {
      // If the chunk is actual stream data, write to local variable.
      const chunk = chunkBuff.toString("utf-8");
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
        stdout.write(chunk);
      }
    });

    childProcess.on("close", () => {
      if (testData) {
        testData = JSON.parse(testData.trim());
      }

      resolve(testData);
    });
  });
};
