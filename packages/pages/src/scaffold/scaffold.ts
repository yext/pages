import { Command } from "commander";
import { modulesCommand } from "./modules/modules.js";

export const scaffoldCommand = (program: Command) => {
  const scaffold = program
    .command("scaffold")
    .description("Adds required files and folder structure for Pages elements")
    .option("--scope <string>", "The subfolder to scaffold from")
    .hook("preSubcommand", (command: Command) => {
      const scope = command.opts().scope;
      if (scope) {
        process.env.YEXT_PAGES_SCOPE = scope;
      }
    })
    .action(() => {
      console.log('Must provide a subcommand of "scaffold".');
    });
  modulesCommand(scaffold);
};
