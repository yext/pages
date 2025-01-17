import fs from "node:fs";
import SourceFileParser, { createTsMorphProject } from "./sourceFileParser.js";
import {
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
} from "ts-morph";

export const tailwindConfigFilename = "tailwind.config.ts";

/**
 * Adds the themeConfig to tailwind.config.ts if it's not there.
 */
export const addThemeConfigToTailwind = (tailwindConfigPath: string) => {
  if (!fs.existsSync(tailwindConfigPath)) {
    throw new Error(`Filepath "${tailwindConfigPath}" is invalid.`);
  }

  const parser = new SourceFileParser(
    tailwindConfigPath,
    createTsMorphProject()
  );

  const defaultExport = parser
    .getSourceFile()
    .getFirstDescendantByKind(SyntaxKind.ExportAssignment);

  if (!defaultExport) {
    throw new Error("Default export not found in the file.");
  }

  // Get the initializer of the default export
  const exportInitializer = defaultExport.getExpression();

  if (!exportInitializer) {
    throw new Error("No initializer found for the default export.");
  }

  // If the initializer includes a `satisfies` clause, extract the object literal
  let configObject: ObjectLiteralExpression | undefined;
  if (
    exportInitializer.getKind() === SyntaxKind.AsExpression ||
    exportInitializer.getKind() === SyntaxKind.SatisfiesExpression
  ) {
    const innerExpression = exportInitializer.getChildAtIndex(0); // Extract left-hand side
    if (innerExpression.getKind() === SyntaxKind.ObjectLiteralExpression) {
      configObject = innerExpression.asKind(SyntaxKind.ObjectLiteralExpression);
    }
  } else if (
    exportInitializer.getKind() === SyntaxKind.ObjectLiteralExpression
  ) {
    configObject = exportInitializer.asKind(SyntaxKind.ObjectLiteralExpression);
  }

  if (!configObject) {
    throw new Error("Config object not found in the default export.");
  }

  // Locate the "theme" property
  let themeProperty = configObject.getProperty("theme") as PropertyAssignment;

  if (
    !themeProperty ||
    themeProperty.getKind() !== SyntaxKind.PropertyAssignment
  ) {
    // Add the "theme" property if it doesn't exist
    themeProperty = configObject.addPropertyAssignment({
      name: "theme",
      initializer: `{
        extend: themeResolver({}, themeConfig)
    }`,
    });
  }

  // Get the value of the theme property
  const themeValue = (themeProperty as PropertyAssignment).getInitializer();

  if (!themeValue) {
    throw new Error("Unable to determine theme initializer.");
  }

  // Check if the theme value is a function call or object literal
  if (themeValue.getKind() === SyntaxKind.CallExpression) {
    // The theme is resolved using a function call
    (themeProperty as PropertyAssignment).setInitializer(`{
        extend: themeResolver({}, themeConfig)
    }`);
  } else if (themeValue.getKind() === SyntaxKind.ObjectLiteralExpression) {
    // The theme is a regular object literal
    const extendProperty = (themeValue as ObjectLiteralExpression).getProperty(
      "extend"
    );
    if (
      extendProperty &&
      extendProperty.getKind() === SyntaxKind.PropertyAssignment
    ) {
      // Modify or replace the "extend" property
      (extendProperty as PropertyAssignment).setInitializer(
        `themeResolver({}, themeConfig)`
      );
    } else {
      // Add "extend" if it doesn't exist
      (themeValue as ObjectLiteralExpression).addPropertyAssignment({
        name: "extend",
        initializer: `themeResolver({}, themeConfig)`,
      });
    }
  } else {
    throw new Error("Unsupported initializer type for the theme property.");
  }

  parser.ensureNamedImport("./theme.config", "themeConfig");
  parser.ensureNamedImport("@yext/visual-editor", "themeResolver");

  parser.format();
  parser.save();
};
