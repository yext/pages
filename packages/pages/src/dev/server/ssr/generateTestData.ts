import { spawn } from "child_process";
import { FeaturesConfig } from "../../../common/src/feature/features";
import {
  CLI_BOILERPLATE_BETA_MESSAGE,
  STREAM_DATA_CHUNK_BEGIN,
  UPGRADE_MESSAGE_LINE_BEGIN,
  UPGRADE_INSTRUCTIONS_LINE_BEGIN,
} from "./constants";
import path from "path";
import fs from "fs";
import { ProjectStructure } from "../../../common/src/project/structure";

/**
 * generateTestData will run yext sites generate-test-data and return true in
 * the event of a successful run and false in the event of a failure.
 */
export const generateTestData = async (): Promise<boolean> => {
  const command = "yext";
  const args = ["sites", "generate-test-data"];

  async function generate() {
    const childProcess = spawn(command, args);
    const exitCode = await new Promise((resolve) => {
      childProcess.on("close", resolve);
    });

    if (exitCode) {
      return false;
    }

    return true;
  }

  return new Promise((resolve) => {
    resolve(generate());
  });
};

export const generateTestDataForPage = async (
  stdout: NodeJS.WriteStream,
  featuresConfig: FeaturesConfig,
  entityId: string,
  locale: string,
  projectStructure: ProjectStructure
): Promise<any> => {
  const siteStreamPath = path.resolve(
    process.cwd(),
    projectStructure.sitesConfigRoot + "/" + projectStructure.siteStreamConfig
  );

  const featureName = featuresConfig.features[0]?.name;
  const command = "yext";
  const args = addCommonArgs(featuresConfig, featureName, locale);

  if (entityId) {
    args.push("--entityIds", entityId);
  }

  if (fs.existsSync(siteStreamPath)) {
    const siteStream = `'${JSON.stringify(
      JSON.parse(fs.readFileSync(siteStreamPath).toString())
    )}'`;
    args.push("--siteStreamConfig", siteStream);
  }

  return new Promise((resolve) => {
    const childProcess = spawn(command, args, {
      stdio: ["inherit", "pipe", "inherit"],
      shell: true,
    });

    // Assume that all CLI chunks will come before any stream data. Once stream data is found
    // assume the rest is relevant.
    let testData = "";
    let foundTestData = false;
    childProcess.stdout.on("data", (chunkBuff: Buffer) => {
      const chunk = chunkBuff.toString("utf-8");

      // If we've found test data at all then we assume the rest of the output is test data.
      if (foundTestData) {
        testData += chunk;
        return;
      }

      // Remove the Yext boilerplate
      let lines = chunk
        .split("\n")
        .filter((l) => !l.startsWith(CLI_BOILERPLATE_BETA_MESSAGE));

      // Check to see if the test data has begun to be printed in this chunk.
      const dataStartIndex = lines.indexOf(STREAM_DATA_CHUNK_BEGIN);
      if (dataStartIndex !== -1) {
        foundTestData = true;
        testData = lines.slice(dataStartIndex).join("\n");
        lines = lines.slice(0, dataStartIndex);
      }

      // If the CLI Boilerplate indicates that the user's version of the YextCLI is
      // out of date, write back the relevant lines to the parent process so they can
      // see their current version relative to the most recent and upgrade instructions.
      const upgradeLines = lines
        .filter(
          (boilerplateLine) =>
            boilerplateLine.startsWith(UPGRADE_MESSAGE_LINE_BEGIN) ||
            boilerplateLine.startsWith(UPGRADE_INSTRUCTIONS_LINE_BEGIN)
        )
        .join("\n");

      if (upgradeLines) {
        stdout.write(upgradeLines);
      } else {
        // This will act as a catch-all to write back any prompts to the the parent process
        // so the user can see it. Its main usage is to allow the user to go through the
        // authentication flow from the parent process.
        const out = lines.join("\n").trim() + "\n";
        out && stdout.write(out);
      }
    });

    childProcess.on("close", () => {
      if (testData) {
        testData = JSON.parse(testData.trim());
      } else {
        stdout.write(
          `Unable to generate test data from command: \`${command} ${args.join(
            " "
          )}\``
        );
      }

      resolve(testData);
    });
  });
};

const addCommonArgs = (
  featuresConfig: FeaturesConfig,
  featureName: string,
  locale: string
) => {
  // We need to specially handle the JSON when running on windows due to an existing bug/behavior in Powershell where inner quotes are
  // stripped from strings when passed to a third-party program. Read more: https://stackoverflow.com/questions/52822984/powershell-best-way-to-escape-double-quotes-in-string-passed-to-an-external-pro.
  let jsonConfig;
  if (process.platform == "win32") {
    jsonConfig = `"${JSON.stringify(featuresConfig).replaceAll(`"`, `\\"`)}"`;
  } else {
    jsonConfig = `'${JSON.stringify(featuresConfig)}'`;
  }

  const args = [
    "sites",
    "generate-test-data",
    "--featureName",
    `"${featureName}"`,
    "--featuresConfig",
    jsonConfig,
    "--locale",
    locale,
    "--printDocuments",
  ];
  return args;
};
