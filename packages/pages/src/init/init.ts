import fs from "fs";
import { runGenerate } from "./generate/interface.js";
import { CommandModule } from "yargs";

interface InitArgs {
  folderToCreate?: string;
}

const handler = async ({ folderToCreate }: InitArgs) => {
  if (folderToCreate) {
    await fs.promises.mkdir(folderToCreate);
    process.chdir(folderToCreate);
    runGenerate(folderToCreate);
  } else {
    const files = await fs.promises.readdir(".");
    if (files.length) {
      process.stdout.write(
        "Refusing to generate project: Directory not empty.\n"
      );
      process.exit(1);
    }
    runGenerate();
  }
};

export const initCommandModule: CommandModule<unknown, InitArgs> = {
  command: "init",
  describe:
    "Clones a pages starter repo, runs `npm install`, and performs the first build, all in one simple command.",
  builder: (yargs) => {
    return yargs.option("folderToCreate", {
      describe: "Destination folder path to create the repo",
      type: "string",
      demandOption: false,
    });
  },
  handler,
};
