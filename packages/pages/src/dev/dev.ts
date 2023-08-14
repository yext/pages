import { Command } from "commander";
import { createServer } from "./server/server.js";
import runSubProcess from "../util/runSubprocess.js";
import { autoYextInit } from "./server/autoInit.js";
import open from "open";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import getPort, { portNumbers } from "get-port";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  local?: boolean;
  prodUrl?: boolean;
  openBrowser: boolean;
  noInit?: boolean;
  scope?: string;
  noGenFeatures?: boolean;
  noGenTestData?: boolean;
  port?: number;
}

const handler = async ({
  local,
  prodUrl,
  openBrowser,
  noInit,
  scope,
  noGenFeatures,
  port,
}: DevArgs) => {
  if (!noInit) {
    await autoYextInit();
  }
  if (!noGenFeatures)
    await runSubProcess(
      "pages generate features",
      scope ? ["--scope" + " " + scope] : []
    );

  const devServerPort =
    port ??
    (await getPort({
      port: portNumbers(5173, 6000),
    }));
  await createServer(!local, !!prodUrl, devServerPort, scope);

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
    .option("--port <number>", "The port to use for the dev server")
    .action(handler);
};
