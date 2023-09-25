import { Command } from "commander";
import path from "path";
import { updatePages } from "./pages_updater.js";
import { migrateConfigs } from "./migrate_config.js";
import { execSync } from "child_process";

const handler = async () => {
  const rootPath = path.resolve("");
  await updatePages(rootPath);
  await migrateConfigs(rootPath);
  execSync("pages generate templates");
  execSync("pages generate artifacts");
};

export const upgradeCommand = (program: Command) => {
  program
    .command("upgrade")
    .description("Upgrade repo to support the latest version of Pages")
    .action(handler);
};
