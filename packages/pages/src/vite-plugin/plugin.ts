import { PluginOption } from "vite";
import {
  Optional,
  ProjectStructure,
  ProjectStructureConfig,
} from "../common/src/project/structure.js";
import { build } from "./build/build.js";
import merge from "lodash/merge.js";

/**
 * Options to configure functionality of the plugin.
 *
 * @public
 */
export type Options = {
  projectStructureConfig?: Optional<ProjectStructureConfig>;
};

const plugin = (opts: Options = {}): PluginOption[] => {
  const projectConfigFromBuildArgs: Optional<ProjectStructureConfig> = {
    filepathsConfig: {
      scope: process.env.YEXT_PAGES_SCOPE,
    },
  };
  const userProjectStructureConfig = merge(
    opts.projectStructureConfig,
    projectConfigFromBuildArgs
  );
  const projectStructure = new ProjectStructure(userProjectStructureConfig);

  return [build(projectStructure)];
};

export default plugin;
export { plugin as yextSSG };
