import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";

/**
 * TemplateParser is a class for parsing the template.
 */
export default class TemplateParser {
  constructor(private originalSfp: SourceFileParser) {}

  /**
   * Parses through originalSfp for essential client side code.
   * Then saves the parsed code into files depending on path.
   * For example, if path is /src/templates/client then the parsed
   * code will be saved into an existing file such as
   * /src/templates/client/location.tsx.
   * @param path to directory where client template files exist.
   */
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
