import { Command } from "commander";
import { modulesCommand } from "./modules/modules.js";

export const scaffoldCommand = (program: Command) => {
  const scaffold = program
    .command("scaffold")
    .description("Adds required files and folder structure for Pages elements")
    .action(() => {
      console.log('Must provide a subcommand of "scaffold".');
    });
  modulesCommand(scaffold);
};
