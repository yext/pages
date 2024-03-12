import { Command } from "commander";
import { generateModule } from "./generate.js";
import { logErrorAndExit } from "../../util/logError.js";

const handler = async () => {
  try {
    await generateModule();
  } catch (error) {
    logErrorAndExit(error);
  }
  process.exit(0);
};

export const modulesCommand = (program: Command) => {
  program
    .command("modules")
    .description(
      "Adds the required files and folder structure for a new Pages module."
    )
    .action(handler);
};
