import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";

/**
 * ClientTemplateParser is a class for parsing the client template.
 */
export default class ClientTemplateParser {
  constructor(private originalSfp: SourceFileParser) {}

  async makeClientTemplate(path: string) {
    const newSfp = new SourceFileParser(
      path + this.originalSfp.getFileName(),
      createTsMorphProject()
    );
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
    newSfp.save();
  }
}
