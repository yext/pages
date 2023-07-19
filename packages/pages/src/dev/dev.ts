import { Command } from "commander";
import { createServer } from "./server/server.js";
import runSubProcess from "../util/runSubprocess.js";
import { devServerPort } from "./server/middleware/constants.js";
import { autoYextInit } from "./server/autoInit.js";
import open from "open";
import { ProjectFilepaths } from "../common/src/project/structure.js";

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
}: DevArgs) => {
  if (!noInit) {
    await autoYextInit();
  }
  if (!noGenFeatures)
    await runSubProcess(
      "pages generate features",
      scope ? ["--scope" + " " + scope] : []
    );

  await createServer(!local, !!useProdURLs, scope);

  if (openBrowser) await open(`http://localhost:${devServerPort}/`);
};

export const devCommand = (program: Command) => {
  program
    .command("dev")
    .description(
      "Creates features.json, generates test data, " +
        "and runs a custom local development server that is backed by Vite."
    )
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .option("--local", "Disables dynamically generated test data")
    .option(
      "--prod-url",
      "Use production URLs, instead of /[template-name]/[external-id]",
      true
    )
    .option(
      "--no-prod-url",
      "Use local URLs, such as /[template-name]/[external-id]",
      false
    )
    .option(
      "--open-browser",
      "Automatically opens the browser on server start-up",
      true
    )
    .option(
      "--no-open-browser",
      "Do not open the browser on server start-up",
      false
    )
    .option("--noInit", "Disables automatic yext init with .yextrc file")
    .option("--noGenFeatures", "Disable feature.json generation step")
    .action(handler);
};
