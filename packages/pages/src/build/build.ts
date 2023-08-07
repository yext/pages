import { Command } from "commander";
import { build } from "vite";
import { ProjectFilepaths } from "../common/src/project/structure.js";

type BuildArgs = Pick<ProjectFilepaths, "scope">;

const handler = async ({ scope }: BuildArgs) => {
  // Pass CLI arguments as env variables to use in vite-plugin
  if (scope) {
    process.env.YEXT_PAGES_SCOPE = scope;
  }
  build();
};

export const buildCommand = (program: Command) => {
  program
    .command("build")
    .description("Build site using Vite")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(handler);
};
