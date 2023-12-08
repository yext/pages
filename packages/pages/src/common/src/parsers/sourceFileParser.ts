import {
  Project,
  SourceFile,
  SyntaxKind,
  ImportDeclarationStructure,
  OptionalKind,
  ImportAttributeStructure,
} from "ts-morph";
import typescript from "typescript";

export function createTsMorphProject() {
  return new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}
/**
 * Creates a SourceFileParser to use ts-morph functions.
 */
export default class SourceFileParser {
  private sourceFile: SourceFile;

  constructor(
    private filepath: string,
    project: Project
  ) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
  }

  getFunctions() {
    return this.sourceFile.getFunctions();
  }

  /**
   * getChildExpressions looks for expressions called within a parent expression.
   * @param parentExpressionName the expression to parse through
   * @param allChildExpressions an array to save parsed expression names into
   */
  getChildExpressions(
    parentExpressionName: string,
    allChildExpressions: string[]
  ) {
    const parentExpression =
      this.sourceFile.getVariableStatement(parentExpressionName);
    const descendantIdentifiers = parentExpression?.getDescendantsOfKind(
      SyntaxKind.Identifier
    );
    descendantIdentifiers?.forEach((identifier) => {
      if (!allChildExpressions.includes(identifier.getText().trim())) {
        allChildExpressions.push(identifier.getText().trim());
        this.getChildExpressions(
          identifier.getText().trim(),
          allChildExpressions
        );
      }
    });
  }

  /**
   * @param names the names of the expressions
   * @returns string[] containing code of each expression
   */
  getExpressionsByName(names: string[]): string[] {
    const expressions: string[] = [];
    names.forEach((name) => {
      expressions.push(this.getExpressionByName(name));
    });
    return expressions;
  }

  /**
   * Ex. source file contains const foo = 5;
   * getExpressionByName("foo") returns "const foo = 5;"
   * @param name of expression
   * @returns string containing expression's code
   */
  getExpressionByName(name: string) {
    if (this.sourceFile.getImportDeclaration(name)) {
      return "";
    }
    let expression = this.sourceFile.getVariableStatement(name)?.getText();
    expression ??= this.sourceFile.getFunction(name)?.getText();
    expression ??= this.sourceFile.getInterface(name)?.getText();
    expression ??= this.sourceFile.getTypeAlias(name)?.getText();
    return expression ?? "";
  }

  /**
   * Adds any strings into source file.
   * @param expressions the strings to add
   */
  addExpressions(expressions: string[]) {
    this.sourceFile.addStatements(expressions);
  }

  /**
   * getDefaultExport parses the source file for a default export.
   * @returns the default export's name
   */
  getDefaultExport(): string {
    const defaultExportSymbol = this.sourceFile.getDefaultExportSymbol();
    if (!defaultExportSymbol) {
      return "";
    }
    const declarations = defaultExportSymbol.getDeclarations();
    const exportDeclaration = declarations[0];
    if (exportDeclaration.isKind(SyntaxKind.FunctionDeclaration)) {
      return exportDeclaration.getName() ?? "";
    } else if (exportDeclaration.isKind(SyntaxKind.ExportAssignment)) {
      const expression = this.sourceFile.getExportAssignment(
        (d) => !d.isExportEquals()
      );
      const defaultName = expression?.getChildAtIndex(2).getText();
      return defaultName ?? "";
    }
    return "";
  }

  /**
   * Adds the default export to source file.
   * @param defaultName the default export's name
   */
  addDefaultExport(defaultName: string) {
    this.sourceFile.addExportAssignment({
      expression: defaultName,
      isExportEquals: false, // set to default
    });
  }

  /**
   * @returns all imports from source file
   */
  getAllImports(): OptionalKind<ImportDeclarationStructure>[] {
    const allImports: OptionalKind<ImportDeclarationStructure>[] = [];
    const imports = this.sourceFile.getImportDeclarations();
    imports.forEach((importDec) => {
      const moduleSpecifier: string = importDec.getModuleSpecifierValue();
      const namedImportsAsString: string[] = [];
      importDec.getNamedImports()?.forEach((namedImport) => {
        namedImportsAsString.push(namedImport.getName());
      });
      const attributes: OptionalKind<ImportAttributeStructure>[] = [];
      importDec
        .getAttributes()
        ?.getElements()
        ?.forEach((element) => {
          attributes.push({
            value: element.getValue().getText(),
            name: element.getName(),
          });
        });
      allImports.push({
        isTypeOnly: importDec.isTypeOnly(),
        defaultImport: importDec.getDefaultImport()?.getText(),
        namedImports: namedImportsAsString,
        namespaceImport: importDec.getNamespaceImport()?.getText(),
        moduleSpecifier: moduleSpecifier,
        attributes: attributes.length === 0 ? undefined : attributes,
      });
    });

    return allImports;
  }

  /**
   * Adds the imports into source file.
   * @param allImports
   */
  setAllImports(allImports: OptionalKind<ImportDeclarationStructure>[]) {
    allImports.forEach((importDec) => {
      let moduleSpecifier: string | undefined;
      this.sourceFile.addImportDeclaration({
        isTypeOnly: importDec.isTypeOnly,
        defaultImport: importDec.defaultImport,
        namedImports: importDec.namedImports,
        namespaceImport: importDec.namespaceImport,
        moduleSpecifier: moduleSpecifier ?? importDec.moduleSpecifier,
        attributes: importDec.attributes,
      });
    });
    this.sourceFile
      .fixMissingImports()
      .organizeImports()
      .fixUnusedIdentifiers();
  }

  getFileName(): string {
    return this.sourceFile.getBaseName();
  }

  /**
   * Saves all changes made to source file.
   */
  save() {
    this.sourceFile.saveSync();
  }

  getAllText(): string {
    return this.sourceFile.getFullText();
  }
}
