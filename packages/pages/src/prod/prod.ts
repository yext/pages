import { CommandModule } from "yargs";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import runSubprocess from "../util/runSubprocess.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  r?: string;
  p?: number;
  f?: string;
  o?: string;
  l?: string;
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

  if (args.r) {
    buildArgs = buildArgs.concat("--root", args.r);
    renderArgs = renderArgs.concat("--root", args.r);
    serveArgs = serveArgs.concat("--root", args.r);
  }

  if (args.p) {
    serveArgs = serveArgs.concat("--port", args.p.toString());
  }

  if (args.f) {
    serveArgs = serveArgs.concat("--files", args.f);
  }

  if (args.o) {
    renderArgs = renderArgs.concat("--output", args.o);
  }

  if (args.l) {
    renderArgs = renderArgs.concat("--localData", args.l);
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
      .option("h", {
        alias: "help",
        describe: "help for pages prod",
        type: "boolean",
        demandOption: false,
      })
      .option("r", {
        alias: "root",
        describe: "[build,render,serve] Path to the repo root directory",
        type: "string",
        demandOption: false,
      })
      .option("p", {
        alias: "port",
        describe: "[serve] Port to serve at (default 8000)",
        type: "number",
        demandOption: false,
      })
      .option("f", {
        alias: "files",
        describe:
          '[serve] Directory of files to serve (default "sites-rendered-output")',
        type: "string",
        demandOption: false,
      })
      .option("o", {
        alias: "output",
        describe:
          '[render] Path to render output directory (default "sites-rendered-output")',
        type: "string",
        demandOption: false,
      })
      .option("l", {
        alias: "localData",
        describe:
          "[render] Relative path to directory with data to generate pages for (default" +
          ' "localData")',
        type: "string",
        demandOption: false,
      })
      .option("hostname", {
        describe: "[build,render] Hostname of site to render",
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
