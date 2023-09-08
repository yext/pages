import { TemplateConfig } from "../template/types.js";
import SourceFileParser from "./sourceFileParser.js";

export const TEMPLATE_CONFIG_VARIABLE_NAME = "config";

/**
 * TemplateConfigParser is a class for parsing the template config.
 */
export default class TemplateConfigParser {
  constructor(private sourceFileParser: SourceFileParser) {}

  /** Returns the template config exported from the page if one is present. */
  getTemplateConfig(): TemplateConfig | undefined {
    const configObjectLiteralExp =
      this.sourceFileParser.getExportedObjectExpression(
        TEMPLATE_CONFIG_VARIABLE_NAME
      );
    return (
      configObjectLiteralExp &&
      this.sourceFileParser.getCompiledObjectLiteral<TemplateConfig>(
        configObjectLiteralExp
      )
    );
  }
}
