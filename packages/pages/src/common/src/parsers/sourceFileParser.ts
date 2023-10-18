import {
  Project,
  SourceFile,
  SyntaxKind,
  ImportDeclarationStructure,
  OptionalKind,
  AssertEntryStructure,
} from "ts-morph";
import typescript from "typescript";

export function createTsMorphProject() {
  return new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}

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

  getExpressionsByName(names: string[]) {
    const expressions: string[] = [];
    names.forEach((name) => {
      expressions.push(this.getExpressionByName(name));
    });
    return expressions;
  }

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

  addExpressions(expressions: string[]) {
    this.sourceFile.addStatements(expressions);
  }

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

  addDefaultExport(defaultName: string) {
    this.sourceFile.addExportAssignment({
      expression: defaultName,
      isExportEquals: false, // set to default
    });
  }

  getAllImports() {
    const allImports: OptionalKind<ImportDeclarationStructure>[] = [];
    const imports = this.sourceFile.getImportDeclarations();
    imports.forEach((importDec) => {
      let moduleSpecifier: string = importDec.getModuleSpecifierValue();
      if (importDec.isModuleSpecifierRelative()) {
        const absolutePath = this.getAbsolutePath(
          this.sourceFile.getFilePath(),
          importDec.getModuleSpecifierValue()
        );
        moduleSpecifier = absolutePath;
      }
      const namedImportsAsString: string[] = [];
      importDec.getNamedImports()?.forEach((namedImport) => {
        namedImportsAsString.push(namedImport.getName());
      });
      const assertElements: OptionalKind<AssertEntryStructure>[] = [];
      importDec
        .getAssertClause()
        ?.getElements()
        ?.forEach((element) => {
          assertElements.push({
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
        assertElements:
          assertElements.length === 0 ? undefined : assertElements,
      });
    });

    return allImports;
  }

  setAllImports(allImports: OptionalKind<ImportDeclarationStructure>[]) {
    allImports.forEach((importDec) => {
      let moduleSpecifier: string | undefined;
      this.sourceFile.addImportDeclaration({
        isTypeOnly: importDec.isTypeOnly,
        defaultImport: importDec.defaultImport,
        namedImports: importDec.namedImports,
        namespaceImport: importDec.namespaceImport,
        moduleSpecifier: moduleSpecifier ?? importDec.moduleSpecifier,
        assertElements: importDec.assertElements,
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

  async save() {
    await this.sourceFile.save();
  }

  private getAbsolutePath = (base: string, relative: string): string => {
    const stack = base.split("/"),
      parts = relative.split("/");
    stack.pop();
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] == ".") continue;
      if (parts[i] == "..") stack.pop();
      else stack.push(parts[i]);
    }
    return stack.join("/");
  };
}
