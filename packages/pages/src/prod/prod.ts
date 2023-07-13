import runSubprocess from "../util/runSubprocess.js";
import { Command } from "commander";

export const prodCommand = (program: Command) => {
  program
    .command("prod")
    .description("Runs a custom local production server")
    .option("--noBuild", "Disable build step")
    .option("--noRender", "Disable render step")
    .action(async (options) => {
      const commandName = "yext pages";
      if (!options.noBuild) await runSubprocess(commandName, ["build"]);
      if (!options.noRender) await runSubprocess(commandName, ["render"]);
      await runSubprocess(commandName, ["serve"]);
    });
};
