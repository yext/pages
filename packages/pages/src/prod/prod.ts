import { CommandModule } from "yargs";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import runSubprocess from "../util/runSubprocess.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  noBuild?: boolean;
  noRender?: boolean;
}

const handler = async (args: DevArgs) => {
  const command = "yext pages";

  if (!args.noBuild) await runSubprocess(command, ["build"]);
  if (!args.noRender) await runSubprocess(command, ["render"]);
  await runSubprocess(command, ["serve"]);
};

export const prodCommandModule: CommandModule<unknown, DevArgs> = {
  command: "prod",
  describe: "Runs a custom local production server",
  builder: (yargs) => {
    return yargs
      .option("help", {
        alias: "h",
        describe: "help for pages prod",
        type: "boolean",
        demandOption: false,
      })
      .option("noBuild", {
        describe: "Disable build step",
        type: "boolean",
        demandOption: false,
      })
      .option("noRender", {
        describe: "Disable render step",
        type: "boolean",
        demandOption: false,
      });
  },
  handler,
};
