import { Command } from "commander";
import { updatePages } from "./pagesUpdater.js";
import { migrateConfigs } from "./migrateConfig.js";
import { templatesHandler } from "../generate/templates/templates.js";
import { artifactsHandler } from "../generate/artifacts/artifacts.js";
import { ProjectStructure } from "../common/src/project/structure.js";

interface UpgradeArgs {
  noMigration?: boolean;
  scope?: string;
}

const handler = async (args: UpgradeArgs) => {
  const scoped = { scope: args.scope || "" };
  const projectStructure = await ProjectStructure.init(scoped);
  await updatePages(projectStructure);
  if (!args.noMigration) {
    await migrateConfigs(projectStructure);
  }
  await templatesHandler(scoped);
  await artifactsHandler(scoped);
};

export const upgradeCommand = (program: Command) => {
  program
    .command("upgrade")
    .description("Upgrade repo to support the latest version of Pages")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .option(
      "--noMigration",
      "Skip the migration to config.yaml and deletion of sites-config"
    )
    .action(handler);
};
