import { Command } from "commander";
import { updatePages } from "./pagesUpdater.js";
import { migrateConfigs } from "./migrateConfig.js";
import { templatesHandler } from "../generate/templates/templates.js";
import { artifactsHandler } from "../generate/artifacts/artifacts.js";

const handler = async ({ scope }: { scope: string }) => {
  await updatePages(scope);
  await migrateConfigs(scope);
  await templatesHandler({ scope: scope });
  await artifactsHandler({ scope: scope });
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
