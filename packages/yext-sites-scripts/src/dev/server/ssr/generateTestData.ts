import { spawn } from "child_process";
import { CogFeatureConfig } from "../../../../../common/feature/cogFeature";
import {
  CLI_BOILERPLATE_CHUNK_BEGIN,
  STREAM_DATA_CHUNK_BEGIN,
  UPGRADE_MESSAGE_LINE_BEGIN,
  UPGRADE_INSTRUCTIONS_LINE_BEGIN,
} from "./constants";

export const generateTestData = async (
  stdout: NodeJS.WriteStream,
  cogFeatureConfig: CogFeatureConfig,
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
        `'${cogFeatureConfig.features[0]?.name}'`,
        "--entityId",
        entityId,
        "--featuresConfig",
        `'${JSON.stringify(cogFeatureConfig)}'`,
        "--locale",
        "en",
        "--printDocuments",
      ],
      {
        stdio: ["inherit", "pipe", "inherit"],
        shell: true,
      }
    );

    // Assume that all CLI chunks will come before any stream data. Once stream data is found
    // assume the rest is relevant.
    let foundTestData = false;
    childProcess.stdout.on("data", (chunkBuff: Buffer) => {
      const chunk = chunkBuff.toString("utf-8");

      // If the chunk is actual stream data, write to local variable.
      if (chunk.startsWith(STREAM_DATA_CHUNK_BEGIN) || foundTestData) {
        foundTestData = true;
        testData += chunk;
        return;
      }

      // If the CLI Boilerplate indicates that the user's version of the YextCLI is
      // out of date, write back the relevant lines to the parent process so they can
      // see their current version relative to the most recent and upgrade instructions.
      if (chunk.startsWith(CLI_BOILERPLATE_CHUNK_BEGIN)) {
        const upgadeLinesInCliBoilerplate = chunk
          .split("\n")
          .filter(
            (boilerplateLine) =>
              boilerplateLine.startsWith(UPGRADE_MESSAGE_LINE_BEGIN) ||
              boilerplateLine.startsWith(UPGRADE_INSTRUCTIONS_LINE_BEGIN)
          )
          .join("\n");

        upgadeLinesInCliBoilerplate &&
          stdout.write(upgadeLinesInCliBoilerplate);
        return;
      }

      // This will act as a catch-all to write back any prompts to the the parent process
      // so the user can see it. Its main usage is to allow the user to go through the
      // authentication flow from the parent process.
      stdout.write(chunk);
    });

    childProcess.on("close", () => {
      if (testData) {
        testData = JSON.parse(testData.trim());
      }

      resolve(testData);
    });
  });
};
