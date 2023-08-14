import { ProjectStructure } from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModules } from "../../common/src/template/internal/loader.js";
import { createFeaturesJson } from "./createFeaturesJson.js";
import { Command } from "commander";

const handler = async (scope: string): Promise<void> => {
  const projectStructure = await ProjectStructure.init({ scope });
  const templateFilepaths = getTemplateFilepaths(
    projectStructure.getTemplatePaths()
  );
  const templateModules = await loadTemplateModules(
    templateFilepaths,
    true,
    false
  );

  await createFeaturesJson(templateModules, projectStructure);
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
