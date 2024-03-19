import { Command } from "commander";
import { build } from "vite";

const handler = async ({ scope }: { scope: string }) => {
  // Pass CLI arguments as env variables to use in vite-plugin
  if (scope) {
    process.env.YEXT_PAGES_SCOPE = scope;
  }
  await build();
};

export const buildCommand = (program: Command) => {
  program
    .command("build")
    .description("Build site using Vite")
    .option("--scope <string>", "The subfolder to scope from")
    .action(handler);
};
