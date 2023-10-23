import fs from "node:fs";
import path from "node:path";
import SourceFileParser, {
  createTsMorphProject,
} from "../parsers/sourceFileParser.js";
import TemplateParser from "../parsers/templateParser.js";
import { ProjectStructure } from "../project/structure.js";
import { readdir } from "fs/promises";

/**
 * Creates directory as well as files for each template
 * if they don't exist already.
 * @param projectStructure
 */
export const makeClientFiles = async (projectStructure: ProjectStructure) => {
  cleanClient(projectStructure);
  const templatePaths = projectStructure.getTemplatePaths();
  for (const templatePath of templatePaths) {
    (await readdir(templatePath.getAbsolutePath(), { withFileTypes: true }))
      .filter((dirent) => !dirent.isDirectory())
      .map((file) => file.name)
      .filter(
        (f) =>
          f !== "_client17.tsx" && f !== "_client.tsx" && f !== "_server.tsx"
      )
      .forEach((template) => {
        const clientDir = path.join(
          projectStructure.config.rootFolders.source,
          projectStructure.config.subfolders.templates,
          projectStructure.config.subfolders.clientBundle
        );
        if (!fs.existsSync(clientDir)) {
          fs.mkdirSync(clientDir);
        }
        fs.openSync(path.join(clientDir, template), "w");
        loadClient(projectStructure, template);
      });
  }
};

/**
 * Adds code to each client file by parsing template file.
 * @param projectStructure
 * @param templateName
 */
const loadClient = (
  projectStructure: ProjectStructure,
  templateName: string
) => {
  const clientPath = path.join(
    projectStructure.config.rootFolders.source,
    projectStructure.config.subfolders.templates,
    projectStructure.config.subfolders.clientBundle
  );
  const templatePath = path.join(
    projectStructure.config.rootFolders.source,
    projectStructure.config.subfolders.templates
  );
  const sfp = new SourceFileParser(
    path.join(templatePath, templateName),
    createTsMorphProject()
  );
  new TemplateParser(sfp).makeClientTemplate(clientPath);
};

/**
 * Deletes /src/templates/client directory and files within it.
 * @param projectStructure
 */
export const cleanClient = (projectStructure: ProjectStructure) => {
  const clientPath = path.join(
    projectStructure.config.rootFolders.source,
    projectStructure.config.subfolders.templates,
    projectStructure.config.subfolders.clientBundle
  );
  if (fs.existsSync(clientPath)) {
    fs.rmSync(clientPath, { recursive: true, force: true });
  }
};
