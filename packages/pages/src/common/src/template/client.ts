import fs from "node:fs";
import path from "node:path";
import SourceFileParser, {
  createTsMorphProject,
} from "../parsers/sourceFileParser.js";
import TemplateParser from "../parsers/templateParser.js";
import { ProjectStructure } from "../project/structure.js";
import { readdir } from "node:fs/promises";
import { logErrorAndExit } from "../../../util/logError.js";

/**
 * Creates a corresponding template.client.tsx for each template.tsx.
 * @param projectStructure
 */
export const makeClientFiles = async (projectStructure: ProjectStructure) => {
  try {
    const templatePaths = projectStructure.getTemplatePaths();
    for (const templatePath of templatePaths) {
      (await readdir(templatePath.getAbsolutePath(), { withFileTypes: true }))
        .filter((dirent) => !dirent.isDirectory())
        .map((file) => file.name)
        .filter(
          (f) =>
            f !== "_client17.tsx" &&
            f !== "_client.tsx" &&
            f !== "_server.tsx" &&
            !f.includes(".client")
        )
        .forEach(async (template) => {
          const templateFilePath = path.join(templatePath.path, template);
          generateAndSaveClientHydrationTemplates(templateFilePath);
        });
    }
  } catch (err) {
    logErrorAndExit("Failed to make client templates.");
    await removeHydrationClientFiles(projectStructure);
  }
};

/**
 * Reads template file and parses code for the hydration client file.
 * Saves parsed code into file at path.
 * @param path src/templates/<templateName>.tsx
 */
const generateAndSaveClientHydrationTemplates = (templatePath: string) => {
  const clientTemplatePath = getClientPath(templatePath);
  fs.writeFileSync(clientTemplatePath, "");
  const sfp = new SourceFileParser(templatePath, createTsMorphProject());
  const newSfp = new SourceFileParser(
    clientTemplatePath,
    createTsMorphProject()
  );
  const templateParser = new TemplateParser(sfp).makeClientTemplateFromSfp(
    newSfp
  );
  templateParser.sourceFile.save();
};

/**
 * @param templatePath /src/templates/location.tsx
 * @returns clientPath /src/templates/location.client.tsx
 */
const getClientPath = (templatePath: string): string => {
  const parsedPath = path.parse(templatePath);
  parsedPath.name = parsedPath.name + ".client";
  parsedPath.base = parsedPath.name + parsedPath.ext;
  return path.format(parsedPath);
};

/**
 * Removes any generated [template].client files.
 * @param projectStructure
 */
export const removeHydrationClientFiles = async (
  projectStructure: ProjectStructure
) => {
  const templatePaths = projectStructure.getTemplatePaths();
  for (const templatePath of templatePaths) {
    (await readdir(templatePath.getAbsolutePath(), { withFileTypes: true }))
      .filter((dirent) => !dirent.isDirectory())
      .map((file) => file.name)
      .filter(
        (f) =>
          f !== "_client17.tsx" &&
          f !== "_client.tsx" &&
          f !== "_server.tsx" &&
          f.includes(".client")
      )
      .forEach(async (template) => {
        const clientPath = path.join(templatePath.getAbsolutePath(), template);
        if (fs.existsSync(clientPath)) {
          fs.rmSync(clientPath);
        }
      });
  }
};
