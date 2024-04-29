import SourceFileParser, {
  createTsMorphProject,
} from "../../parsers/sourceFileParser.js";

/**
 * @param modulePath
 * @returns name of module if set by user via ModuleConfig
 */
export const getModuleName = (modulePath: string): string | undefined => {
  const sfp = new SourceFileParser(modulePath, createTsMorphProject());
  return sfp.getVariablePropertyByName("config", "name")?.replace(/['"`]/g, "");
};
