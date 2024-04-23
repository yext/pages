import runSubprocess from "../util/runSubprocess.js";
import { Command } from "commander";

interface ProdArgs {
  noBuild?: boolean;
  noRender?: boolean;
  scope?: string;
}

const handler = async ({ noBuild, noRender, scope }: ProdArgs) => {
  const command = "yext pages";

  if (!noBuild) {
    await runSubprocess(command, ["build", scope ? `--scope ${scope}` : ""]);
  }
  if (!noRender) {
    await runSubprocess(command, ["render", scope ? `--scope ${scope}` : ""]);
  }
  await runSubprocess(command, ["serve"]);
};

export const prodCommand = (program: Command) => {
  program
    .command("prod")
    .description("Runs a custom local production server")
    .option("--noBuild", "Disable build step")
    .option("--noRender", "Disable render step")
    .option("--scope  <string>", "The subfolder to scope from")
    .action(handler);
};
