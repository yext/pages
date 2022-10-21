import glob from "glob";
import path from "path";
import { Path } from "../../project/path.js";

/**
 * Get all the template files in the provided template folder path(s).
 * If there are two files that share the same name between the two
 * provided template folder paths, only the file in domain template
 * folder path is collected.
 *
 * @param root  The folder path where all template files live
 * @param domain The folder path where the template files of a specific domain live
 * @returns a list of template filepaths
 */
export const getTemplateFilepaths = (root: Path, domain?: Path): string[] => {
  const templatesRootFilepaths: string[] = glob.sync(
    `${root.getAbsolutePath()}/*.{tsx,jsx,js,ts}`
  );
  if (!domain) {
    return templatesRootFilepaths;
  }
  const templatesDomainFilepaths: string[] = glob.sync(
    `${domain.getAbsolutePath()}/*.{tsx,jsx,js,ts}`
  );
  const templatesDomainFilenames = templatesDomainFilepaths.map((t) =>
    path.basename(t)
  );
  return [
    ...templatesDomainFilepaths,
    ...templatesRootFilepaths.filter(
      (t) => !templatesDomainFilenames.includes(path.basename(t))
    ),
  ];
};
