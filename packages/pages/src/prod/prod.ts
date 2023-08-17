import runSubprocess from "../util/runSubprocess.js";
import { Command } from "commander";

interface ProdArgs {
  noBuild?: boolean;
  noRender?: boolean;
  scope?: string;
}

const handler = async (args: ProdArgs) => {
  const command = "yext pages";
  if (!args.noBuild) await runSubprocess(command, ["build"]);
  if (!args.noRender) await runSubprocess(command, ["render"]);
  await runSubprocess(command, ["serve"]);
};

export const prodCommand = (program: Command) => {
  program
    .command("prod")
    .description("Runs a custom local production server")
    .option("--noBuild", "Disable build step")
    .option("--noRender", "Disable render step")
    .action(handler);
};
