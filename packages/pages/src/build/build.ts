import { Command } from "commander";
import { build } from "vite";
import { scopedViteConfigPath } from "../util/viteConfig.js";
import { REVERSE_PROXY_PREFIX_ENV_VAR } from "../util/reverseProxyOverride.js";

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
 * Runs the Pages production build with CLI arguments forwarded into the Vite plugin environment.
 */
export const buildHandler = async (buildArgs: BuildArgs) => {
  const { scope, pluginFilesizeLimit, pluginTotalFilesizeLimit, reverseProxyPrefix } = buildArgs;

  // Pass CLI arguments as env variables to use in vite-plugin
  if (scope) {
    process.env.YEXT_PAGES_SCOPE = scope;
  }
  process.env.YEXT_PAGES_PLUGIN_FILESIZE_LIMIT = String(pluginFilesizeLimit);
  process.env.YEXT_PAGES_PLUGIN_TOTAL_FILESIZE_LIMIT = String(pluginTotalFilesizeLimit);
  if (reverseProxyPrefix) {
    process.env[REVERSE_PROXY_PREFIX_ENV_VAR] = reverseProxyPrefix;
  } else {
    delete process.env[REVERSE_PROXY_PREFIX_ENV_VAR];
  }

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
    .action(buildHandler);
};
