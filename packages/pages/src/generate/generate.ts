import { CommandModule } from "yargs";
import { featureCommandModule } from "./features/features.js";

export const generateCommandModule: CommandModule = {
  command: "generate",
  describe: "Generates a specific file",
  builder: (yargs) => {
    return yargs.command(featureCommandModule).demandCommand();
  },
  handler: () => {
    console.log('Must provide a subcommand of "generate".');
  },
};
