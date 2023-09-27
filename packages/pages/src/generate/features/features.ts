import { ProjectStructure } from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { Command } from "commander";
import { createTemplatesJson } from "../templates/createTemplatesJson.js";

const handler = async ({ scope }: { scope: string }): Promise<void> => {
  const projectStructure = await ProjectStructure.init({ scope });
  const templateFilepaths = getTemplateFilepaths(
    projectStructure.getTemplatePaths()
  );

  await createTemplatesJson(templateFilepaths, projectStructure, "FEATURES");
};

export const featureCommand = (program: Command) => {
  program
    .command("features")
    .description("Generates features.json file")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(handler);
};
