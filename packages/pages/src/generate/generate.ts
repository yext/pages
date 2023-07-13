import { Command } from "commander";
import { featureCommand } from "./features/features.js";
import { ciCommand } from "./ci/ci.js";

export const generateCommand = (program: Command) => {
  const generate = program
    .command("generate")
    .description("Generates a specific file")
    .action(() => {
      console.log('Must provide a subcommand of "generate".');
    });
  featureCommand(generate);
  ciCommand(generate);
};
