import { PluginOption } from "vite";
import {
  Optional,
  ProjectStructure,
  ProjectStructureConfig,
} from "../common/src/project/structure.js";
import { build } from "./build/build.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const plugin = async (): Promise<PluginOption[]> => {
  const projectConfigFromBuildArgs: Optional<ProjectStructureConfig> = {
    scope: process.env.YEXT_PAGES_SCOPE,
  };
  const projectStructure = await ProjectStructure.init(
    projectConfigFromBuildArgs
  );

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
