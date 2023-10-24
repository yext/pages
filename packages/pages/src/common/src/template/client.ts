import fs from "node:fs";
import path from "node:path";
import SourceFileParser, {
  createTsMorphProject,
} from "../parsers/sourceFileParser.js";
import TemplateParser from "../parsers/templateParser.js";
import { ProjectStructure } from "../project/structure.js";
import { readdir } from "node:fs/promises";

const CLIENT_TEMPLATE_PATH = ".sites";

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
        if (!fs.existsSync(CLIENT_TEMPLATE_PATH)) {
          fs.mkdirSync(CLIENT_TEMPLATE_PATH);
        }
        fs.openSync(path.join(CLIENT_TEMPLATE_PATH, template), "w");
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
  const templatePath = path.join(
    projectStructure.config.rootFolders.source,
    projectStructure.config.subfolders.templates
  );
  const sfp = new SourceFileParser(
    path.join(templatePath, templateName),
    createTsMorphProject()
  );
  new TemplateParser(sfp).makeClientTemplate(CLIENT_TEMPLATE_PATH);
};

/**
 * Removes .sites directory and files within.
 *  */
const cleanClient = () => {
  if (fs.existsSync(CLIENT_TEMPLATE_PATH)) {
    fs.rmSync(CLIENT_TEMPLATE_PATH, { recursive: true, force: true });
  }
};
