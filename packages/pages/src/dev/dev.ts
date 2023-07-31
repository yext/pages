import { Command } from "commander";
import { createServer } from "./server/server.js";
import runSubProcess from "../util/runSubprocess.js";
import { devServerPort } from "./server/middleware/constants.js";
import { autoYextInit } from "./server/autoInit.js";
import open from "open";

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
    .option(
      "--noGenFeatures",
      "Disable templates.config (or features.json) generation step"
    )
    .option("--yaml", "Write to templates.config + artifacts.config")
    .action(async (options) => {
      if (!options.noInit) {
        await autoYextInit();
      }
      if (!options.noGenFeatures)
        await runSubProcess(
          "pages generate features",
          options.scope
            ? ["--scope" + " " + options.scope, options.yaml ? "--yaml" : ""]
            : [options.yaml ? "--yaml" : ""]
        );
      await createServer(
        !options.local,
        !!options.useProdURLs,
        options.scope,
        options.yaml
      );
      if (options.openBrowser) await open(`http://localhost:${devServerPort}/`);
    });
};
