import { createServer } from "./server/server.js";
import open from "open";
import { autoYextInit } from "./server/autoInit.js";
import { devServerPort } from "./server/middleware/constants.js";
import runSubProcess from "../util/runSubprocess.js";
import { Command } from "commander";

export const devCommand = (program: Command) => {
  program
    .command("dev")
    .description(
      "Creates features.json, generates test data, " +
        "and runs a custom local development server that is backed by Vite."
    )
    .option("local, noGenTestData", "Disables dynamically generated test data")
    .option(
      "scope <string>",
      "The subfolder to scope the served templates from"
    )
    .option(
      "prod-url",
      "Use production URLs, instead of /[template-name]/[external-id]",
      true
    )
    .option(
      "open-browser",
      "Automatically opens the browser on server start-up",
      true
    )
    .option("noInit", "Disables automatic yext init with .yextrc file")
    .option("noGenFeatures", "Disable feature.json generation step")
    .action(async (options) => {
      if (!options.noInit) {
        await autoYextInit();
      }
      if (!options.noGenFeatures)
        await runSubProcess(
          "pages generate features",
          options.scope ? ["--scope" + " " + options.scope] : []
        );

      await createServer(!options.local, !!options.useProdURLs, options.scope);

      if (options.openBrowser) await open(`http://localhost:${devServerPort}/`);
    });
};
