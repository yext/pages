import fs from "fs";
import { runGenerate } from "./generate/interface.js";
import { Command } from "commander";

export const initCommand = (program: Command) => {
  program
    .command("init")
    .description(
      "Clones a pages starter repo, runs `npm install`, and performs the first build."
    )
    .option(
      "folderToCreate <string>",
      "Destination folder path to create the repo"
    )
    .action(async (options) => {
      const folderToCreate = options.folder;
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
    });
};
