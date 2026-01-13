import { ProjectStructure } from "../../common/src/project/structure.js";
import { createTemplatesJson } from "./createTemplatesJson.js";
import { Command } from "commander";

export const templatesHandler = async ({ scope }: { scope: string }): Promise<void> => {
  const projectStructure = await ProjectStructure.init({ scope });

  await createTemplatesJson(projectStructure, "TEMPLATES");
};

export const templatesCommand = (program: Command) => {
  program
    .command("templates")
    .description("Generates templates.json file")
    .option("--scope <string>", "The subfolder to scope the served templates from")
    .action(templatesHandler);
};
