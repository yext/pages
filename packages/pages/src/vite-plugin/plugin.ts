import { PluginOption, Plugin } from "vite";
import { ProjectStructure } from "../common/src/project/structure.js";
import { build } from "./build/build.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import {
  makeClientFiles,
  removeHydrationClientFiles,
} from "../common/src/template/client.js";
import fs from "node:fs";
import path from "path";

const plugin = async (): Promise<PluginOption[]> => {
  const projectStructure = await ProjectStructure.init({
    scope: process.env.YEXT_PAGES_SCOPE,
  });
  const pluginFilesizeLimit = Number(
    process.env.YEXT_PAGES_PLUGIN_FILESIZE_LIMIT
  );
  const pluginTotalFilesizeLimit = Number(
    process.env.YEXT_PAGES_PLUGIN_TOTAL_FILESIZE_LIMIT
  );

  const hasPublicAssets = fs.existsSync(
    projectStructure.config.subfolders.public
  );

  return [
    clientHydration(projectStructure),
    build(projectStructure, pluginFilesizeLimit, pluginTotalFilesizeLimit),
    nodePolyfills({
      globals: {
        Buffer: "build",
        global: "build",
        process: "build",
      },
    }),
    hasPublicAssets ? copyPublicAssets(projectStructure) : null,
    cleanup(projectStructure),
  ];
};

const clientHydration = async (
  projectStructure: ProjectStructure
): Promise<Plugin> => {
  return {
    name: "client-hydration:build",
    apply: "build",
    buildStart: {
      sequential: true,
      async handler() {
        await makeClientFiles(projectStructure);
      },
    },
  };
};

const cleanup = async (projectStructure: ProjectStructure): Promise<Plugin> => {
  return {
    name: "client-hydration:cleanup",
    apply: "build",
    closeBundle: {
      handler() {
        removeHydrationClientFiles(projectStructure);
      },
    },
  };
};

const copyPublicAssets = async (
  projectStructure: ProjectStructure
): Promise<Plugin> => {
  const { rootFolders, subfolders } = projectStructure.config;
  return {
    name: "copy-public-assets",
    buildEnd: () => {
      fs.cpSync(
        subfolders.public,
        path.join(`${rootFolders.dist}/public_assets`),
        {
          recursive: true,
        }
      );
    },
  };
};

// cleanup on interruption (ctrl + C)
process.on("SIGINT", async () => {
  const projectStructure = await ProjectStructure.init({
    scope: process.env.YEXT_PAGES_SCOPE,
  });
  removeHydrationClientFiles(projectStructure);
  process.nextTick(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  const projectStructure = await ProjectStructure.init({
    scope: process.env.YEXT_PAGES_SCOPE,
  });
  removeHydrationClientFiles(projectStructure);
  process.nextTick(() => process.exit(0));
});

export default plugin;
export { plugin as yextSSG };
