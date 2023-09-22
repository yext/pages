import { Command } from "commander";
import path from "path";
import { updatePages } from "./pages_updater.js";
import { migrateConfigs } from "./migrate_config.js";

const handler = async () => {
  // Pass CLI arguments as env variables to use in vite-plugin
  const rootPath = path.resolve("");
  await updatePages(rootPath);
  await migrateConfigs(rootPath);
};

export const upgradeCommand = (program: Command) => {
  program
    .command("upgrade")
    .description("Upgrade repo to support the latest version of Pages")
    .action(handler);
};
