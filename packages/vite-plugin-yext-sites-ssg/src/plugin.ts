import { PluginOption } from "vite";
import {
  ProjectStructure,
  ProjectStructureConfig,
} from "../../common/src/project/structure.js";
import { build } from "./build/build.js";

/**
 * Options to configure functionality of the plugin.
 *
 * @public
 */
export type Options = {
  projectStructureConfig?: ProjectStructureConfig;
};

const plugin = (opts: Options = {}): PluginOption[] => {
  const projectStructure = new ProjectStructure(opts.projectStructureConfig);

  return [build(projectStructure)];
};

export default plugin;
export { plugin as yextSSG };
