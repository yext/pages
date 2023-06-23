import { createServer } from "./server/server.js";
import { CommandModule } from "yargs";
import open from "open";
import fs from "fs";
import YAML from "yaml";
import { spawn } from "child_process";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import { devServerPort } from "./server/middleware/constants.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  local?: boolean;
  "prod-url"?: boolean;
  "open-browser": boolean;
}

const handler = async ({
  scope,
  local,
  "prod-url": useProdURLs,
  "open-browser": openBrowser,
}: DevArgs) => {
  await autoYextInit();
  await createServer(!local, !!useProdURLs, scope);
  if (!openBrowser) {
    return;
  }
  await open(`http://localhost:${devServerPort}/`);
};

const autoYextInit = async () => {
  if (!fs.existsSync(".yextrc")) return;
  try {
    const yextrcContents: string = fs.readFileSync(".yextrc", "utf8");
    const parsedContents = YAML.parse(yextrcContents);
    const businessId: string = parsedContents.businessId;
    const universe: string = parsedContents.universe;
    await runCommand("yext", ["init", businessId, "-u", universe]);
  } catch (error) {
    console.error(
      "Could not parse .yextrc file properly. Please make sure it is formatted correctly with a valid businessId and universe (valid options include sandbox or production)."
    );
    process.exit(1);
  }
};

const runCommand = (command: string, args: string[]) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args);
    childProcess.on("close", (code) => {
      code === 0 ? resolve(null) : reject();
    });
  });
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
      });
  },
  handler,
};
