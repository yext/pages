import runSubprocess from "../util/runSubprocess.js";
import { Command } from "commander";

interface ProdArgs {
  noBuild?: boolean;
  noRender?: boolean;
  scope?: string;
  reverseProxyPrefix?: string;
}

/**
 * Runs the local production flow by chaining build, render, and serve commands.
 */
export const prodHandler = async ({ noBuild, noRender, scope, reverseProxyPrefix }: ProdArgs) => {
  const command = "yext pages";

  if (!noBuild) {
    const buildArgs = ["build"];
    if (scope) {
      buildArgs.push(`--scope ${scope}`);
    }
    if (reverseProxyPrefix) {
      buildArgs.push(`--reverse-proxy-prefix ${reverseProxyPrefix}`);
    }
    await runSubprocess(command, buildArgs);
  }
  if (!noRender) {
    const renderArgs = ["render"];
    if (scope) {
      renderArgs.push(`--scope ${scope}`);
    }
    await runSubprocess(command, renderArgs);
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
    .option(
      "--reverse-proxy-prefix <string>",
      "The reverse proxy prefix to apply to the build step"
    )
    .action(prodHandler);
};
