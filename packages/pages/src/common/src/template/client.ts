import path from "node:path";
import SourceFileParser, { createTsMorphProject } from "../parsers/sourceFileParser.js";
import TemplateParser from "../parsers/templateParser.js";
import { convertToPosixPath } from "./paths.js";

export const clientTemplateQuery = "?yext-client";

/** Identifies the client module while preserving the template's import directory and extension. */
export const getClientTemplateId = (templatePath: string): string =>
  convertToPosixPath(path.resolve(templatePath)) + clientTemplateQuery;

/** Extracts client-side code without writing a hydration template to disk. */
export const generateClientTemplate = (templatePath: string): string => {
  const parsedPath = path.parse(templatePath);
  const clientPath = path.join(parsedPath.dir, `${parsedPath.name}.client${parsedPath.ext}`);
  const sourceProject = createTsMorphProject();
  sourceProject.compilerOptions.set({ allowJs: true });
  const clientProject = createTsMorphProject();
  clientProject.compilerOptions.set({ allowJs: true });
  clientProject.createSourceFile(clientPath, "", { overwrite: true });

  const originalSfp = new SourceFileParser(templatePath, sourceProject);
  const clientSfp = new SourceFileParser(clientPath, clientProject);
  return new TemplateParser(originalSfp).makeClientTemplateFromSfp(clientSfp).fileContents;
};
