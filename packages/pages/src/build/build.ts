import { CommandModule } from "yargs";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import { build } from "vite";

type BuildArgs = Pick<ProjectFilepaths, "scope">;

const handler = async ({ scope }: BuildArgs) => {
  // Pass CLI arguments as env variables to use in vite-plugin
  if (scope) {
    process.env.YEXT_PAGES_SCOPE = scope;
  }
  await build();
};

export const buildCommandModule: CommandModule<unknown, BuildArgs> = {
  command: "build",
  describe: "Build site using Vite",
  builder: (yargs) => {
    return yargs.option("scope", {
      describe: "The subfolder to scope the served templates from",
      type: "string",
      demandOption: false,
    });
  },
  handler,
};
