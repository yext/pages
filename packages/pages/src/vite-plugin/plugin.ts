import { PluginOption } from "vite";
import {
  Optional,
  ProjectStructure,
  ProjectStructureConfig,
} from "../common/src/project/structure.js";
import { build } from "./build/build.js";

const plugin = (): PluginOption[] => {
  const projectConfigFromBuildArgs: Optional<ProjectStructureConfig> = {
    filepathsConfig: {
      scope: process.env.YEXT_PAGES_SCOPE,
    },
  };
  const projectStructure = new ProjectStructure(projectConfigFromBuildArgs);

  return [build(projectStructure)];
};

export default plugin;
export { plugin as yextSSG };
