import { Command } from "commander";
import { generateModule } from "./generate.js";
import { logErrorAndExit } from "../../util/logError.js";
import { ProjectStructure } from "../../common/src/project/structure.js";

const handler = async () => {
  const scope = process.env.YEXT_PAGES_SCOPE;
  const projectStructure = await ProjectStructure.init({ scope });
  try {
    await generateModule(projectStructure);
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
