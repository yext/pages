import { Command } from "commander";
import { updatePages } from "./pages_updater.js";
import { migrateConfigs } from "./migrate_config.js";
import { ProjectStructure } from "../common/src/project/structure.js";
import { templatesHandler } from "../generate/templates/templates.js";
import { artifactsHandler } from "../generate/artifacts/artifacts.js";

const handler = async ({ scope }: { scope: string }) => {
  const scoped = { scope: scope };
  const projectStructure = await ProjectStructure.init(scoped);
  await updatePages(projectStructure);
  await migrateConfigs(projectStructure);
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
    .action(handler);
};
