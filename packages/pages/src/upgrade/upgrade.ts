import { Command } from "commander";
import {
  checkLegacyMarkdown,
  checkNodeVersion,
  installDependencies,
  removeFetchImport,
  updateDevDependencies,
  updatePackageEngines,
  updatePackageScripts,
  updatePagesJSToCurrentVersion,
  updateToUsePagesComponents,
} from "./pagesUpdater.js";
import { migrateConfigs } from "./migrateConfig.js";
import { templatesHandler } from "../generate/templates/templates.js";
import { artifactsHandler } from "../generate/artifacts/artifacts.js";
import { ProjectStructure } from "../common/src/project/structure.js";
import path from "path";

interface UpgradeArgs {
  noMigration?: boolean;
  scope?: string;
}

const handler = async (args: UpgradeArgs) => {
  const scoped = { scope: args.scope || "" };
  const root = path.resolve(scoped.scope);
  const source = path.resolve(root, "src");
  const projectStructure = await ProjectStructure.init(scoped);
  await updateDevDependencies(root);
  checkLegacyMarkdown(source);
  removeFetchImport(source);
  updatePackageScripts(root);
  updatePackageEngines(root);
  checkNodeVersion();
  await updatePagesJSToCurrentVersion(root);
  await updateToUsePagesComponents(root, source);
  await installDependencies(root, projectStructure);
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
