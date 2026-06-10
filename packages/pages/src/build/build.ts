import { Command } from "commander";
import { build } from "vite";
import { ProjectStructure } from "../common/src/project/structure.js";
import { scopedViteConfigPath } from "../util/viteConfig.js";
import { applyReverseProxyOverride } from "../util/reverseProxyOverride.js";

/**
 * The arguments passed to the build CLI command.
 * @internal
 */
export interface BuildArgs {
  scope?: string;
  pluginFilesizeLimit: number;
  pluginTotalFilesizeLimit: number;
  reverseProxyPrefix?: string;
}

/**
 * Applies build-time repo overrides, then runs the Pages production build.
 */
const handler = async (buildArgs: BuildArgs) => {
  const { scope, pluginFilesizeLimit, pluginTotalFilesizeLimit, reverseProxyPrefix } = buildArgs;
  const trimmedReverseProxyPrefix = reverseProxyPrefix?.trim();

  if (trimmedReverseProxyPrefix) {
    const projectStructure = await ProjectStructure.init({ scope });
    applyReverseProxyOverride(projectStructure, trimmedReverseProxyPrefix);
  }

  // Pass CLI arguments as env variables to use in vite-plugin
  if (scope) {
    process.env.YEXT_PAGES_SCOPE = scope;
  }
  process.env.YEXT_PAGES_PLUGIN_FILESIZE_LIMIT = String(pluginFilesizeLimit);
  process.env.YEXT_PAGES_PLUGIN_TOTAL_FILESIZE_LIMIT = String(pluginTotalFilesizeLimit);

  await build({
    configFile: scopedViteConfigPath(scope),
  });
};

export const buildCommand = (program: Command) => {
  program
    .command("build")
    .description("Build site using Vite")
    .option("--scope <string>", "The subfolder to scope from")
    .option("--plugin-filesize-limit <number>", "The max size of a single plugin file in MB", "10")
    .option(
      "--plugin-total-filesize-limit <number>",
      "The max size of all plugin files combined in MB",
      "10"
    )
    .option("--reverse-proxy-prefix <string>", "The reverse proxy prefix to apply to the build")
    .action(handler);
};
