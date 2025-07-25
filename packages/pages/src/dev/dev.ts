import { Command } from "commander";
import { createServer } from "./server/server.js";
import { autoYextInit } from "./server/autoInit.js";
import open from "open";
import getPort, { portNumbers } from "get-port";
import { isUsingConfig } from "../util/config.js";
import { logWarning } from "../util/logError.js";
import { ProjectStructure } from "../common/src/project/structure.js";

/**
 * The arguments passed to the dev CLI command.
 * @internal
 */
export interface DevArgs {
  local?: boolean;
  prodUrl?: boolean;
  openBrowser: boolean;
  noInit?: boolean;
  scope?: string;
  noGenFeatures?: boolean;
  noGenTestData?: boolean;
  port?: number;
  module?: string;
  siteId?: number;
}

const handler = async (devArgs: DevArgs) => {
  const { openBrowser, noInit, scope, port, module } = devArgs;
  const { config } = (await ProjectStructure.init({ scope })).config.rootFiles;

  if (!isUsingConfig(config, scope)) {
    logWarning(
      "It looks like you are using an older setup of a Pages repo. Please run `npx pages upgrade`" +
        " to upgrade to the latest format. This will setup a new configuration file, config.yaml," +
        " and install some new required dependencies.\n" +
        "If you would like to upgrade without using the new config, run `npx pages upgrade --noMigration`."
    );
  }

  if (!noInit) {
    await autoYextInit(scope);
  }

  const devServerPort =
    port ??
    (await getPort({
      port: portNumbers(5173, 6000),
    }));

  await createServer(devServerPort, devArgs);

  if (openBrowser && !module) {
    await open(`http://localhost:${devServerPort}/`);
  }
};

/**
 * @internal
 */
export const devCommand = (program: Command) => {
  program
    .command("dev")
    .description(
      "Creates features.json, generates test data, " +
        "and runs a custom local development server that is backed by Vite."
    )
    .option("--scope <string>", "The subfolder to scope from")
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
    .option("--module <string>", "Name of the module to load.")
    .option(
      "--siteId <number>",
      "The id of the site to use with in-platform page sets."
    )
    .action(handler);
};
