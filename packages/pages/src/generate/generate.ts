import { CommandModule } from "yargs";
import { featureCommandModule } from "./features/features.js";
import { ciCommandModule } from "./ci/ci.js";

export const generateCommandModule: CommandModule = {
  command: "generate",
  describe: "Generates a specific file",
  builder: (yargs) => {
    return yargs
      .command(featureCommandModule)
      .command(ciCommandModule)
      .demandCommand();
  },
  handler: () => {
    console.log('Must provide a subcommand of "generate".');
  },
};
