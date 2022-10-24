import { createServer } from "./server/server.js";
import { viteDevServerPort } from "./server/middleware/constants.js";
import { CommandModule } from "yargs";
import open from "open";

interface DevArgs {
  scope?: string;
  local?: boolean;
}

const handler = async ({ scope, local }: DevArgs) => {
  await createServer(!local, scope);
  await open(`http://localhost:${viteDevServerPort}/`);
};

export const devCommandModule: CommandModule<unknown, DevArgs> = {
  command: "dev",
  describe: "Runs a custom local development server that is backed by Vite",
  builder: (yargs) => {
    return yargs
      .option("local", {
        describe: "Disable dynamically generated test data",
        type: "boolean",
        demandOption: false,
      })
      .option("scope", {
        describe:
          "The subfolder to scope the dev build to a subset of templates.",
        type: "string",
        demandOption: false,
      });
  },
  handler,
};
