import { Command } from "commander";
import { build } from "vite";

export const buildCommand = (program: Command) => {
  program
    .command("build")
    .description("Build site using Vite")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(async (options) => {
      // Pass CLI arguments as env variables to use in vite-plugin
      const scope = options.scope;
      if (scope) {
        process.env.YEXT_PAGES_SCOPE = scope;
      }
      build();
    });
};
