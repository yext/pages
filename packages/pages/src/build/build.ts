import { Command } from "commander";
import { build } from "vite";
import { ProjectStructure } from "../common/src/project/structure.js";
import { makeClientFiles } from "../common/src/template/client.js";

const handler = async ({ scope }: { scope: string }) => {
  // Pass CLI arguments as env variables to use in vite-plugin
  if (scope) {
    process.env.YEXT_PAGES_SCOPE = scope;
  }
  const projectStructure = await ProjectStructure.init({
    scope: scope,
  });
  await makeClientFiles(projectStructure);
  await build();
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
