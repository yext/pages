import path from "path";
import { Path } from "../../common/src/project/path.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModules } from "../../common/src/template/internal/loader.js";
import { createFeaturesJson } from "./createFeaturesJson.js";
import { Command } from "commander";

export const featureCommand = (program: Command) => {
  program
    .command("features")
    .description("Generates features.json file")
    .option(
      "scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(async (options, command) => {
      const scope = options.scope;
      const projectStructure = new ProjectStructure();
      const templatesRoot = projectStructure.templatesRoot.path;
      const sitesConfigRoot = projectStructure.sitesConfigRoot.path;
      const templateRootAbsolutePath = path.join(process.cwd(), templatesRoot);
      const templateFilepaths = getTemplateFilepaths(
        scope
          ? [
              new Path(path.join(templateRootAbsolutePath, scope)),
              new Path(templateRootAbsolutePath),
            ]
          : [new Path(templateRootAbsolutePath)]
      );
      const templateModules = await loadTemplateModules(
        templateFilepaths,
        true,
        false
      );
      const featuresFilepath = path.join(
        process.cwd(),
        sitesConfigRoot,
        scope ?? "",
        "features.json"
      );
      await createFeaturesJson(templateModules, featuresFilepath);
    });
};
