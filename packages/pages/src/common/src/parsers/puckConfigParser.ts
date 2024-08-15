import fs from "node:fs";
import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";
import { newConfig } from "../../../scaffold/template/sampleTemplates.js";
import { SyntaxKind } from "ts-morph";

/**
 * Adds variables to the puck config file and adds the new config to
 * the exported map.
 * @param fileName template name with invalid chars and spaces removed
 * @param filepath /src/ve.config.tsx
 */
export function addDataToPuckConfig(fileName: string, filepath: string) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Filepath "${filepath}" is invalid.`);
  }
  const parser = new SourceFileParser(filepath, createTsMorphProject());

  const puckConfigsStatement = parser.getVariableStatement("puckConfigs");

  const formattedTemplateName =
    fileName.charAt(0).toUpperCase() + fileName.slice(1);

  const puckConfigsStartLocation = puckConfigsStatement.getStart();
  parser.insertStatement(
    newConfig(formattedTemplateName, fileName),
    puckConfigsStartLocation
  );

  const puckConfigsDeclaration = parser.getVariableDeclaration("puckConfigs");
  const puckConfigsInitializer = puckConfigsDeclaration.getInitializer();
  if (
    puckConfigsInitializer &&
    puckConfigsInitializer.getKind() === SyntaxKind.NewExpression
  ) {
    const newExpression = puckConfigsInitializer;
    const puckConfigsArray = newExpression.getFirstChildByKindOrThrow(
      SyntaxKind.ArrayLiteralExpression
    );
    puckConfigsArray.addElement(`["${fileName}", ${fileName}Config]`);
  }
  parser.format();
  parser.save();
}
