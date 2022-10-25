import { CommandModule } from "yargs";
import { features } from "./features.js";

const featureCommandModule: CommandModule = {
  command: "features",
  describe: "Generates features.json file",
  handler: () => {
    features();
  },
};

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
