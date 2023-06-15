import { CommandModule } from "yargs";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import runSubprocess from "../util/runSubprocess.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  root?: string;
  port?: number;
  files?: string;
  output?: string;
  localData?: string;
  hostname?: string;
  noBuild?: boolean;
  noRender?: boolean;
  noServe?: boolean;
}

const handler = async (args: DevArgs) => {
  const command = "yext pages";
  let buildArgs = ["build"];
  let renderArgs = ["render"];
  let serveArgs = ["serve"];

  if (args.root) {
    buildArgs = buildArgs.concat("--root", args.root);
    renderArgs = renderArgs.concat("--root", args.root);
    serveArgs = serveArgs.concat("--root", args.root);
  }

  if (args.port) {
    serveArgs = serveArgs.concat("--port", args.port.toString());
  }

  if (args.files) {
    serveArgs = serveArgs.concat("--files", args.files);
  }

  if (args.output) {
    renderArgs = renderArgs.concat("--output", args.output);
  }

  if (args.localData) {
    renderArgs = renderArgs.concat("--localData", args.localData);
  }

  if (args.hostname) {
    buildArgs = buildArgs.concat("--hostname", args.hostname);
    renderArgs = renderArgs.concat("--hostname", args.hostname);
  }

  if (!args.noBuild) await runSubprocess(command, buildArgs);
  if (!args.noRender) await runSubprocess(command, renderArgs);
  if (!args.noServe) await runSubprocess(command, serveArgs);
};

export const prodCommandModule: CommandModule<unknown, DevArgs> = {
  command: "prod",
  describe: "Runs a custom local production server",
  builder: (yargs) => {
    return yargs
      .option("help", {
        alias: "h",
        describe: "help for pages prod",
        type: "boolean",
        demandOption: false,
      })
      .option("root", {
        alias: "r",
        describe: "Path to the repo root directory",
        type: "string",
        demandOption: false,
      })
      .option("port", {
        alias: "p",
        describe: "Port to serve at (default 8000)",
        type: "number",
        demandOption: false,
      })
      .option("files", {
        alias: "f",
        describe:
          'Directory of files to serve (default "sites-rendered-output")',
        type: "string",
        demandOption: false,
      })
      .option("output", {
        alias: "o",
        describe:
          'Path to render output directory (default "sites-rendered-output")',
        type: "string",
        demandOption: false,
      })
      .option("localData", {
        alias: "l",
        describe:
          "Relative path to directory with data to generate pages for (default:" +
          " local_data)",
        type: "string",
        demandOption: false,
      })
      .option("hostname", {
        describe: "Hostname of site to render",
        type: "string",
        demandOption: false,
      })
      .option("noBuild", {
        describe: "Disable build step",
        type: "boolean",
        demandOption: false,
      })
      .option("noRender", {
        describe: "Disable render step",
        type: "boolean",
        demandOption: false,
      })
      .option("noServe", {
        describe: "Disable serve step",
        type: "boolean",
        demandOption: false,
      });
  },
  handler,
};
