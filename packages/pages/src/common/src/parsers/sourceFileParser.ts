import {
  Project,
  SourceFile,
  SyntaxKind,
  FunctionDeclaration,
  ObjectLiteralExpression,
  ArrowFunction,
} from "ts-morph";
import vm from "node:vm";
import typescript from "typescript";
import { processEnvVariables } from "../../../util/processEnvVariables.js";

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

  getExportedObjectExpression(
    variableName: string
  ): ObjectLiteralExpression | undefined {
    const variableStatement = this.sourceFile
      .getVariableStatements()
      .find((variableStatement) => {
        return (
          variableStatement.isExported() &&
          variableStatement
            .getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration)
            .getName() === variableName
        );
      });
    if (!variableStatement) {
      return;
    }
    const objectLiteralExp = variableStatement.getFirstDescendantByKind(
      SyntaxKind.ObjectLiteralExpression
    );
    if (!objectLiteralExp) {
      throw new Error(
        `Could not find ObjectLiteralExpression within \`${variableStatement.getFullText()}\`.`
      );
    }
    return objectLiteralExp;
  }

  getExportFunctionExpression(
    functionName?: string
  ): ObjectLiteralExpression[] | ObjectLiteralExpression | undefined {
    if (functionName) {
      const functionDeclaration = this.sourceFile.getFunction(
        (f) => f.isExported() && f.getName() === functionName
      );
      const objectLiteralExp = functionDeclaration?.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression
      );
      return objectLiteralExp;
    }
    const functionDeclarations = this.sourceFile.getFunctions();
    const objectLiteralExpressions: ObjectLiteralExpression[] = [];
    functionDeclarations.forEach((fd) => {
      if (fd.isExported()) {
        objectLiteralExpressions.push(
          fd.getFirstAncestorByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
        );
      }
    });
    return objectLiteralExpressions;
  }

  getFunctions() {
    return this.sourceFile.getFunctions();
  }

  getFunctionNode(
    funcName: string
  ): FunctionDeclaration | ArrowFunction | undefined {
    return (
      this.sourceFile.getFunction(funcName) ??
      this.sourceFile
        .getVariableDeclaration(funcName)
        ?.getFirstChildByKind(SyntaxKind.ArrowFunction)
    );
  }

  /**
   * This function takes in an {@link ObjectLiteralExpression} and returns it's data.
   *
   * It converts a js object string and converts it into an object using vm.runInNewContext,
   * which can be thought of as a safe version of `eval`. Note that we cannot use JSON.parse here,
   * because we are working with a js object not a JSON.
   */
  getCompiledObjectLiteral<T>(objectLiteralExp: ObjectLiteralExpression): T {
    return vm.runInNewContext(
      "(" + objectLiteralExp.getText() + ")",
      processEnvVariables("YEXT_PUBLIC", false)
    );
  }
}
