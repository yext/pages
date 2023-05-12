import path from "path";
import { CommandModule } from "yargs";
import { Path } from "../../common/src/project/path.js";
import {
  defaultProjectStructureConfig,
  ProjectFilepaths,
  ProjectStructure,
} from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModules } from "../../common/src/template/internal/loader.js";
import { createFeaturesJson } from "./createFeaturesJson.js";

type FeaturesArgs = Pick<ProjectFilepaths, "scope">;

const handler = async ({ scope }: FeaturesArgs): Promise<void> => {
  const templatesRoot =
    defaultProjectStructureConfig.filepathsConfig.templatesRoot;
  const sitesConfigRoot =
    defaultProjectStructureConfig.filepathsConfig.sitesConfigRoot;
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
    false,
    {} as ProjectStructure // doesn't matter here
  );
  const featuresFilepath = path.join(
    process.cwd(),
    sitesConfigRoot,
    scope ?? "",
    "features.json"
  );
  await createFeaturesJson(templateModules, featuresFilepath);
};

export const featureCommandModule: CommandModule<unknown, FeaturesArgs> = {
  command: "features",
  describe: "Generates features.json file",
  builder: (yargs) => {
    return yargs.option("scope", {
      describe: "The subfolder to scope the served templates from",
      type: "string",
      demandOption: false,
    });
  },
  handler,
};
