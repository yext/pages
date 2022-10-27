import shell from "shelljs";
import { CommandModule } from "yargs";
import { ProjectFilepaths } from "../common/src/project/structure.js";

type BuildArgs = Pick<ProjectFilepaths, "scope">;

const handler = async ({ scope }: BuildArgs) => {
  // Pass CLI arguments as env variables to use in vite-plugin
  shell.exec("vite build", {
    env: {
      ...process.env,
      YEXT_PAGES_SCOPE: scope,
    },
  });
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
