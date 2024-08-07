import { ProjectStructure } from "../../common/src/project/structure.js";
import { Command } from "commander";
import { createTemplatesJson } from "../templates/createTemplatesJson.js";
import { logErrorAndExit } from "../../util/logError.js";

const handler = async ({ scope }: { scope: string }): Promise<void> => {
  const projectStructure = await ProjectStructure.init({ scope });

  try {
    await createTemplatesJson(projectStructure, "FEATURES");
  } catch (error) {
    logErrorAndExit(error);
  }
};

export const featureCommand = (program: Command) => {
  program
    .command("features")
    .description("Generates features.json file")
    .option("--scope <string>", "The subfolder to scope from")
    .action(handler);
};
