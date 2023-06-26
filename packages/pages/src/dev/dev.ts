import { createServer } from "./server/server.js";
import { CommandModule } from "yargs";
import open from "open";
import { autoYextInit } from "./server/autoInit.js";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import { devServerPort } from "./server/middleware/constants.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  local?: boolean;
  "prod-url"?: boolean;
  "open-browser": boolean;
  "auto-init"?: boolean;
}

const handler = async ({
  scope,
  local,
  "prod-url": useProdURLs,
  "open-browser": openBrowser,
  "auto-init": autoInit,
}: DevArgs) => {
  if (autoInit) {
    await autoYextInit();
  }
  await createServer(!local, !!useProdURLs, scope);
  if (!openBrowser) {
    return;
  }
  await open(`http://localhost:${devServerPort}/`);
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
      })
      .option("open-browser", {
        describe: "Automatically opens the browser on server start-up",
        type: "boolean",
        demandOption: false,
        default: true,
      })
      .option("auto-init", {
        describe: "Disables automatic yext init with .yextrc file",
        type: "boolean",
        demandOption: false,
        default: true,
      });
  },
  handler,
};
