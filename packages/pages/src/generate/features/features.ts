import path from "path";
import { CommandModule } from "yargs";
import { Path } from "../../common/src/project/path.js";
import { ProjectFilepaths } from "../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModules } from "../../common/src/template/internal/loader.js";
import { createFeaturesJson } from "./createfeaturesjson.js";

type FeaturesArgs = Pick<
  ProjectFilepaths,
  "templatesRoot" | "sitesConfigRoot" | "scope"
>;

const handler = async ({
  templatesRoot,
  sitesConfigRoot,
  scope,
}: FeaturesArgs): Promise<void> => {
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

export const featureCommandModule: CommandModule<unknown, FeaturesArgs> = {
  command: "features",
  describe: "Generates features.json file",
  builder: (yargs) => {
    return yargs
      .option("templatesRoot", {
        describe: "The folder path where all template files live",
        type: "string",
        default: "src/templates",
        demandOption: false,
      })
      .option("sitesConfigRoot", {
        describe: "The folder path where the sites-config files live",
        type: "string",
        default: "sites-config",
        demandOption: false,
      })
      .option("scope", {
        describe: "The subfolder to scope the served templates from",
        type: "string",
        demandOption: false,
      });
  },
  handler,
};
