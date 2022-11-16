import glob from "glob";
import path from "path";
import { Path } from "../../project/path.js";
import { ProjectStructure } from "../../project/structure.js";

/**
 * Get all the template files in the provided template folder path(s).
 *
 * If there are files that share the same name between the provided
 * template folder paths, only the file found in the first visited path
 * from the list is included.
 *
 * @param paths  a list of paths to collect template files from
 * @returns a list of template filepaths
 */
export const getTemplateFilepaths = (paths: Path[]): string[] => {
  const templateFilepaths: string[] = [];
  const addedFilenames: Set<string> = new Set();
  paths.forEach((p) => {
    const filepaths = glob.sync(`${p.getAbsolutePath()}/*.{tsx,jsx,js,ts}`);
    filepaths.forEach((f) => {
      const fileName = path.basename(f);
      if (!addedFilenames.has(fileName)) {
        addedFilenames.add(fileName);
        templateFilepaths.push(f);
      }
    });
  });
  return templateFilepaths;
};

export const getTemplateFilepathsFromProjectStructure = (
  projectStructure: ProjectStructure
): string[] => {
  return getTemplateFilepaths(
    projectStructure.scopedTemplatesPath
      ? [projectStructure.scopedTemplatesPath, projectStructure.templatesRoot]
      : [projectStructure.templatesRoot]
  );
};
