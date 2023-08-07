import path from "path";
import { Path } from "../../common/src/project/path.js";
import {
  ProjectStructure,
  ProjectFilepaths,
} from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModules } from "../../common/src/template/internal/loader.js";
import { createFeaturesJson } from "./createFeaturesJson.js";
import { Command } from "commander";

type FeaturesArgs = Pick<ProjectFilepaths, "scope">;

const handler = async ({ scope }: FeaturesArgs): Promise<void> => {
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
