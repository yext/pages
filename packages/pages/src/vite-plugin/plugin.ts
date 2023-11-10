import { PluginOption, Plugin } from "vite";
import { ProjectStructure } from "../common/src/project/structure.js";
import { build } from "./build/build.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import {
  makeClientFiles,
  removeHydrationClientFiles,
} from "../common/src/template/client.js";

const plugin = async (): Promise<PluginOption[]> => {
  const projectStructure = await ProjectStructure.init({
    scope: process.env.YEXT_PAGES_SCOPE,
  });

  return [
    clientHydration(projectStructure),
    build(projectStructure),
    nodePolyfills({
      globals: {
        Buffer: "build",
        global: "build",
        process: "build",
      },
    }),
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

export default plugin;
export { plugin as yextSSG };
