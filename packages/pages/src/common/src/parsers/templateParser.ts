import fs from "node:fs";
import path from "node:path";
import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";

/**
 * TemplateParser is a class for parsing the template.
 */
export default class TemplateParser {
  constructor(private originalSfp: SourceFileParser) {}

  /**
   * Creates newSourceFileParser, newSfp, to pass through
   * makeClientTemplateFromSfp when given a valid filepath.
   * @param filepath to directory where client template files exist.
   * @return output and newSfp.
   */
  makeClientTemplateFromPath(filepath: string) {
    const clientPath = path.join(filepath, this.originalSfp.getFileName());
    if (!fs.existsSync(clientPath)) {
      throw new Error(`Filepath "${filepath}" is invalid.`);
    }
    const newSfp = new SourceFileParser(clientPath, createTsMorphProject());
    return this.makeClientTemplateFromSfp(newSfp);
  }

  /**
   * Parses through originalSfp for essential client side code.
   * Then returns the parsed code as well as the SourceFileParser.
   * SourceFileParser.save() must be called to save changes to file.
   * @param newSfp the new sourceFileParser.
   * @return output and newSfp.
   */
  makeClientTemplateFromSfp(newSfp: SourceFileParser) {
    const defaultExportName = this.originalSfp.getDefaultExport();
    const childExpressionNames: string[] = [defaultExportName];
    this.originalSfp.getChildExpressions(
      defaultExportName,
      childExpressionNames
    );
    const childExpressions =
      this.originalSfp.getExpressionsByName(childExpressionNames);
    const imports = this.originalSfp.getAllImports();

    if (defaultExportName !== "") {
      newSfp.addExpressions(childExpressions.filter((s) => s));
      newSfp.addDefaultExport(defaultExportName);
      newSfp.setAllImports(imports);
    }
    return {
      fileContents: newSfp.getAllText(),
      sourceFile: newSfp,
    };
  }
}
