import fs from "node:fs";
import path from "node:path";
import SourceFileParser, {
  createTsMorphProject,
} from "../parsers/sourceFileParser.js";
import TemplateParser from "../parsers/templateParser.js";
import { ProjectStructure } from "../project/structure.js";
import { readdir } from "node:fs/promises";
import { glob } from "glob";
import { convertToPosixPath } from "./paths.js";

/**
 * Creates files for and loads each template if they don't already exist.
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
            f.indexOf("client.tsx") === -1
        )
        .forEach(async (template) => {
          const templatePath = path.join(
            projectStructure.config.rootFolders.source,
            projectStructure.config.subfolders.templates
          );
          const clientPath = path.join(
            templatePath,
            formatTemplateName(template)
          );
          if (fs.existsSync(clientPath)) {
            return;
          }
          fs.openSync(clientPath, "w");
          await loadClient(projectStructure, template);
        });
    }
  } catch (err) {
    console.error("Failed to make client templates.");
    cleanClient(projectStructure);
  }
};

/**
 * Adds code to each client file by parsing template file.
 * @param projectStructure
 * @param templateName
 */
const loadClient = async (
  projectStructure: ProjectStructure,
  templateName: string
) => {
  const templatePath = path.join(
    projectStructure.config.rootFolders.source,
    projectStructure.config.subfolders.templates
  );
  const sfp = new SourceFileParser(
    path.join(templatePath, templateName),
    createTsMorphProject()
  );
  const newSfp = new SourceFileParser(
    path.join(templatePath, formatTemplateName(templateName)),
    createTsMorphProject()
  );
  const templateParser = new TemplateParser(sfp).makeClientTemplateFromSfp(
    newSfp
  );
  templateParser.sourceFile.save();
};

const formatTemplateName = (templateName: string): string => {
  return templateName.replace(".tsx", ".client.tsx");
};

/**
 * Removes client.tsx files
 * @param projectStructure
 */
export const cleanClient = (projectStructure: ProjectStructure) => {
  const files = glob.sync(
    convertToPosixPath(
      path.join(
        path.resolve(
          projectStructure.config.rootFolders.source,
          projectStructure.config.subfolders.templates
        ),
        "**/*.client.tsx"
      )
    )
  );
  files.forEach((file) => {
    fs.rmSync(file);
  });
};
