import { Command } from "commander";
import { logErrorAndExit } from "../../util/logError.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { generateTemplate } from "./generate.js";

const handler = async () => {
  const scope = process.env.YEXT_PAGES_SCOPE;
  const projectStructure = await ProjectStructure.init({ scope });
  try {
    await generateTemplate(projectStructure);
  } catch (error) {
    logErrorAndExit(error);
  }
  process.exit(0);
};

export const templateCommand = (program: Command) => {
  program
    .command("template")
    .description("Adds the required files and folder structure for a new Pages template.")
    .action(handler);
};
