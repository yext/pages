import fs from "node:fs";
import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";
import { newConfig } from "../../../scaffold/template/sampleTemplates.js";
import { SyntaxKind } from "ts-morph";

/**
 * ConfigParser is a class for parsing the puck config file.
 */
export default class ConfigParser {
  /**
   * Adds variables to the puckConfig file and adds the new config to
   * the exported map.
   * @param templateName as recieved by user input
   * @param formattedTemplateName capitalized first letter of fileName
   * @param fileName removed invalid chars from templateName
   * @param filepath /src/puck/ve.config.ts
   */
  addDataToPuckConfig(
    templateName: string,
    formattedTemplateName: string,
    fileName: string,
    filepath: string
  ) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`Filepath "${filepath}" is invalid.`);
    }
    const newSfp = new SourceFileParser(filepath, createTsMorphProject());

    const puckConfigsStatement = newSfp.getVariableStatement("puckConfigs");

    const puckConfigsStartLocation = puckConfigsStatement.getStart();
    newSfp.insertStatement(
      newConfig(formattedTemplateName, fileName),
      puckConfigsStartLocation
    );

    const puckConfigsDeclaration = newSfp.getVariableDeclaration("puckConfigs");
    const puckConfigsInitializer = puckConfigsDeclaration.getInitializer();
    if (
      puckConfigsInitializer &&
      puckConfigsInitializer.getKind() === SyntaxKind.NewExpression
    ) {
      const newExpression = puckConfigsInitializer;
      const puckConfigsArray = newExpression.getFirstChildByKindOrThrow(
        SyntaxKind.ArrayLiteralExpression
      );
      puckConfigsArray.addElement(`["${templateName}", ${fileName}Config]`);
    }
    newSfp.format();
    newSfp.save();
  }
}
