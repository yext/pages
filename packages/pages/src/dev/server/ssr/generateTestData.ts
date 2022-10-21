import { spawn } from "child_process";
import { FeaturesConfig } from "../../../common/src/feature/features.js";
import {
  CLI_BOILERPLATE_BETA_MESSAGE,
  STREAM_DATA_CHUNK_BEGIN,
  UPGRADE_MESSAGE_LINE_BEGIN,
  UPGRADE_INSTRUCTIONS_LINE_BEGIN,
} from "./constants.js";
import path from "path";
import fs from "fs";
import { ProjectStructure } from "../../../common/src/project/structure.js";

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
    projectStructure.sitesConfigRoot.getAbsolutePath() +
      "/" +
      projectStructure.siteStreamConfig
  );

  const featureName = featuresConfig.features[0]?.name;
  const command = "yext";
  let args = addCommonArgs(featuresConfig, featureName);

  if (entityId) {
    args = args.concat("--entityIds", entityId);
  }

  const isAlternateLanguageFields =
    !!featuresConfig.features[0]?.alternateLanguageFields;
  if (!isAlternateLanguageFields) {
    args = args.concat("--locale", locale);
  }

  if (fs.existsSync(siteStreamPath)) {
    const siteStream = prepareJsonForCmd(
      JSON.parse(fs.readFileSync(siteStreamPath).toString())
    );
    args = args.concat("--siteStreamConfig", siteStream);
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
        const out = lines.join("\n").trim();
        out && stdout.write(out + "\n");
      }
    });

    childProcess.on("close", () => {
      let parsedData: any;
      if (testData) {
        try {
          const documents = parseConcatenatedDocuments(testData.trim());
          if (documents.length === 1) {
            parsedData = documents[0];
          } else {
            parsedData = getDocumentByLocale(documents, locale);
          }
        } catch (e) {
          stdout.write(
            `\nUnable to parse test data from command: \`${command} ${args.join(
              " "
            )}\``
          );
          resolve(null);
        }
      } else {
        stdout.write(
          `\nUnable to generate test data from command: \`${command} ${args.join(
            " "
          )}\``
        );
      }

      resolve(parsedData);
    });
  });
};

const addCommonArgs = (featuresConfig: FeaturesConfig, featureName: string) => {
  const args = [
    "pages",
    "generate-test-data",
    "--featureName",
    `"${featureName}"`,
    "--featuresConfig",
    prepareJsonForCmd(featuresConfig),
    "--printDocuments",
  ];
  return args;
};

// We need to specially handle JSON arguemnts when running on windows due to an existing bug/behavior in Powershell where inner quotes are
// stripped from strings when passed to a third-party program. Read more: https://stackoverflow.com/questions/52822984/powershell-best-way-to-escape-double-quotes-in-string-passed-to-an-external-pro.
const prepareJsonForCmd = (json: any) => {
  let jsonString;
  if (process.platform == "win32") {
    jsonString = `${JSON.stringify(json).replace(/([\\]*)"/g, `$1$1\\"`)}`;
  } else {
    jsonString = `'${JSON.stringify(json)}'`;
  }
  return jsonString;
};

// When using a CLI version <= 0.1_299 there is a chance multiple documents will be returned consecutively, without proper containment.
// Look for them and parse as an array. This can be removed once the CLI handles multiple documents as an array https://yexttest.atlassian.net/browse/SPR-4712
const parseConcatenatedDocuments = (documentResponse: string): any[] => {
  const DOCUMENT_SEPARATOR = `}\n{\n  "__`;
  const DOCUMENT_JOINER = `},\n{\n  "__`;
  const objects = documentResponse
    .split(DOCUMENT_SEPARATOR)
    .join(DOCUMENT_JOINER);
  return JSON.parse(`[${objects}]`);
};

const getDocumentByLocale = (documents: any[], locale: string): any => {
  return documents.find((document) => document.locale === locale);
};
