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
  updateServerlessFunctionTypeReferences,
  updateToUsePagesComponents,
} from "./pagesUpdater.js";
import { migrateConfigs } from "./migrateConfig.js";
import { ProjectStructure } from "../common/src/project/structure.js";
import path from "path";

interface UpgradeArgs {
  noMigration?: boolean;
  scope?: string;
}

const handler = async (args: UpgradeArgs) => {
  const scoped = { scope: args.scope || "" };
  const projectStructure = await ProjectStructure.init(scoped);
  const source = path.resolve(projectStructure.config.rootFolders.source);

  // check proper Node version first
  checkNodeVersion();

  // log warnings
  checkLegacyMarkdown(source);

  // update deps, scripts, engines
  await updateDevDependencies();
  updatePackageScripts();
  updatePackageEngines();
  await updatePagesJSToCurrentVersion();

  // update code usages
  removeFetchImport(source);
  await updateToUsePagesComponents(source);
  updateServerlessFunctionTypeReferences(
    path.resolve(source, projectStructure.config.subfolders.serverlessFunctions)
  );

  // install deps
  await installDependencies();

  // migrate to consolidated configs (for all scopes)
  if (!args.noMigration) {
    await migrateConfigs(projectStructure);
  }
};

export const upgradeCommand = (program: Command) => {
  program
    .command("upgrade")
    .description("Upgrade repo to support the latest version of Pages")
    .option("--scope <string>", "The subfolder to scope the served templates from")
    .option("--noMigration", "Skip the migration to config.yaml and deletion of sites-config")
    .action(handler);
};
