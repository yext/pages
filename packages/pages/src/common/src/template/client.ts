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
            !f.includes(".client.")
        )
        .forEach(async (template) => {
          const relativePath = path.join(templatePath.path, template);
          fs.writeFileSync(formatClientPath(relativePath), "");
          await generateAndSaveClientHydrationTemplates(relativePath);
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
const generateAndSaveClientHydrationTemplates = async (path: string) => {
  const sfp = new SourceFileParser(path, createTsMorphProject());
  const newSfp = new SourceFileParser(
    formatClientPath(path),
    createTsMorphProject()
  );
  const templateParser = new TemplateParser(sfp).makeClientTemplateFromSfp(
    newSfp
  );
  templateParser.sourceFile.save();
};

const formatClientPath = (clientPath: string): string => {
  const templatePath = path.parse(clientPath);
  return path.join(
    templatePath.dir,
    templatePath.name + ".client" + templatePath.ext
  );
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
          f.includes(".client.")
      )
      .forEach(async (template) => {
        const clientPath = path.join(
          projectStructure.config.rootFolders.source,
          projectStructure.config.subfolders.templates,
          template
        );
        if (fs.existsSync(clientPath)) {
          fs.rmSync(clientPath);
        }
      });
  }
};
