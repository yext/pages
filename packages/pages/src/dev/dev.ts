import { createServer } from "./server/server.js";
import { viteDevServerPort } from "./server/middleware/constants.js";
import { CommandModule } from "yargs";
import openBrowser from "react-dev-utils/openBrowser";
import { ProjectFilepaths } from "../common/src/project/structure.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  local?: boolean;
  "prod-url"?: boolean;
}

const handler = async ({ scope, local, "prod-url": useProdURLs }: DevArgs) => {
  await createServer(!local, !!useProdURLs, scope);
  await openBrowser(`http://localhost:${viteDevServerPort}/`);
};

export const devCommandModule: CommandModule<unknown, DevArgs> = {
  command: "dev",
  describe: "Runs a custom local development server that is backed by Vite",
  builder: (yargs) => {
    return yargs
      .option("local", {
        describe: "Disables dynamically generated test data",
        type: "boolean",
        demandOption: false,
      })
      .option("scope", {
        describe: "The subfolder to scope the served templates from",
        type: "string",
        demandOption: false,
      })
      .option("prod-url", {
        describe:
          "Use production URLs, instead of /[template-name]/[external-id]",
        type: "boolean",
        demandOption: false,
        default: true,
      });
  },
  handler,
};
