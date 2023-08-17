import { PluginOption } from "vite";
import { ProjectStructure } from "../common/src/project/structure.js";
import { build } from "./build/build.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const plugin = async (): Promise<PluginOption[]> => {
  const projectStructure = await ProjectStructure.init({
    scope: process.env.YEXT_PAGES_SCOPE,
  });

  return [
    build(projectStructure),
    nodePolyfills({
      globals: {
        Buffer: "build",
        global: "build",
        process: "build",
      },
    }),
  ];
};

export default plugin;
export { plugin as yextSSG };
