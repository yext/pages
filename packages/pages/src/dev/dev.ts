import { createServer } from "./server/server.js";
import { CommandModule } from "yargs";
import open from "open";
import { autoYextInit } from "./server/autoInit.js";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import { devServerPort } from "./server/middleware/constants.js";
import runSubProcess from "../util/runSubprocess.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  local?: boolean;
  "prod-url"?: boolean;
  "open-browser": boolean;
  noInit?: boolean;
  scope?: string;
  noGenFeatures?: boolean;
  noGenTestData?: boolean;
}

const handler = async ({
  local,
  "prod-url": useProdURLs,
  "open-browser": openBrowser,
  noInit,
  scope,
  noGenFeatures,
  noGenTestData,
}: DevArgs) => {
  if (!noInit) {
    await autoYextInit();
  }
  if (!noGenFeatures)
    await runSubProcess(
      "pages generate features",
      scope ? ["--scope" + " " + scope] : []
    );

  if (!noGenTestData) await runSubProcess("yext pages generate-test-data", []);
  await createServer(!local, !!useProdURLs, scope);

  if (openBrowser) await open(`http://localhost:${devServerPort}/`);
};

export const devCommandModule: CommandModule<unknown, DevArgs> = {
  command: "dev",
  describe:
    "Creates features.json, generates test data, and runs a custom local development" +
    " server that is backed by Vite.",
  builder: (yargs) => {
    return yargs
      .option("h", {
        alias: "help",
        describe: "Help for pages dev",
        type: "boolean",
        demandOption: false,
      })
      .option("local", {
        describe: "Disables dynamically generated test data",
        type: "boolean",
        demandOption: false,
      })
      .option("scope", {
        describe: "The subfolder to scope the served templates from",
        type: "string",
        demandOption: false,
      })
      .option("prod-url", {
        describe:
          "Use production URLs, instead of /[template-name]/[external-id]",
        type: "boolean",
        demandOption: false,
        default: true,
      })
      .option("open-browser", {
        describe: "Automatically opens the browser on server start-up",
        type: "boolean",
        demandOption: false,
        default: true,
      })
      .option("noInit", {
        describe: "Disables automatic yext init with .yextrc file",
        type: "boolean",
        demandOption: false,
        default: false,
      })
      .option("noGenFeatures", {
        describe: "Disable feature.json generation step",
        type: "boolean",
        demandOption: false,
      })
      .option("noGenTestData", {
        describe: "Disable test data generation step",
        type: "boolean",
        demandOption: false,
      });
  },
  handler,
};
