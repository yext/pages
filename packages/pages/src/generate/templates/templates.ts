import { ProjectStructure } from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModules } from "../../common/src/template/internal/loader.js";
import { createTemplatesJson } from "./createTemplatesJson.js";
import { Command } from "commander";

const handler = async ({ scope }: { scope: string }): Promise<void> => {
  const projectStructure = await ProjectStructure.init({ scope });
  const templateFilepaths = getTemplateFilepaths(
    projectStructure.getTemplatePaths()
  );
  const templateModules = await loadTemplateModules(
    templateFilepaths,
    true,
    false
  );

  createTemplatesJson(templateModules, projectStructure);
};

export const templatesCommand = (program: Command) => {
  program
    .command("templates")
    .description("Generates templates.json file")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(handler);
};
