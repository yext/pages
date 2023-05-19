import glob from "glob";
import path from "path";
import { Path } from "../../project/path.js";
import { ProjectStructure } from "../../project/structure.js";
import { ClientServerRenderTemplates } from "../types.js";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Get all the template files in the provided template folder path(s).
 *
 * If there are files that share the same name between the provided
 * template folder paths, only the file found in the first visited path
 * from the list is included.
 *
 * @param paths a list of paths to collect template files from
 * @returns a list of template filepaths
 */
export const getTemplateFilepaths = (paths: Path[]): string[] => {
  const templateFilepaths: string[] = [];
  const addedFilenames: Set<string> = new Set();
  paths.forEach((p) => {
    const filepaths = glob.sync(`${p.getAbsolutePath()}/*.{tsx,jsx,js,ts}`);
    filepaths
      // Don't include the client/server rendering templates
      .filter(
        (f) =>
          f.indexOf(globalClientRenderFilename) === -1 &&
          f.indexOf(globalServerRenderFilename) === -1
      )
      .forEach((f) => {
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

const globalClientRenderFilename = "_client.tsx";
const globalServerRenderFilename = "_server.tsx";

/**
 * Determines the client and server rendering templates to use. It first looks for a _client/server.tsx file in the scoped
 * path. Then looks in the templatesRoot path. Finally, if none exist, defaults to a built-in rendering template that aligns
 * with the originally hardcoded template that was used before this configurable feature was added.
 *
 * This DOES NOT take into account template-level rendering customizability. It only returns the global render templates.
 *
 * @param templatesRootPath the path where the templates live, typically src/templates
 * @param scopedTemplatePath the subfolder path inside templatesRoot to scope to - used in multibrand setups
 */
export const getGlobalClientServerRenderTemplates = (
  templatesRootPath: Path,
  scopedTemplatePath: Path | undefined
): ClientServerRenderTemplates => {
  const [clientRenderTemplatePath, usingCustomClient] = findGlobalRenderFile(
    templatesRootPath,
    scopedTemplatePath,
    globalClientRenderFilename
  );
  const [serverRenderTemplatePath, usingCustomServer] = findGlobalRenderFile(
    templatesRootPath,
    scopedTemplatePath,
    globalServerRenderFilename
  );

  return {
    clientRenderTemplatePath,
    serverRenderTemplatePath,
    isCustomRenderTemplate: usingCustomClient || usingCustomServer,
  };
};

/**
 * @param templatesRootPath the path where the templates live, typically src/templates
 * @param scopedTemplatePath the subfolder path inside templatesRoot to scope to - used in multibrand setups
 * @param globalFilename the file to find
 * @returns the path to the appropriate file along with a boolean denoting if the path returned is a custom render template
 */
const findGlobalRenderFile = (
  templatesRootPath: Path,
  scopedTemplatePath: Path | undefined,
  globalFilename: string
): [string, boolean] => {
  if (scopedTemplatePath) {
    const pathToGlobalFile = path.join(
      scopedTemplatePath.getAbsolutePath(),
      globalFilename
    );
    if (fs.existsSync(pathToGlobalFile)) {
      return [pathToGlobalFile, true];
    }
  }

  const pathToGlobalFile = path.join(
    templatesRootPath.getAbsolutePath(),
    globalFilename
  );

  if (fs.existsSync(pathToGlobalFile)) {
    return [pathToGlobalFile, true];
  }

  let curDirectory = import.meta.url;
  // Jest doesn't like import.meta.url, so we use ts-jest-mock-import-meta to statically replace
  // it during tests. Then we need to dynmamically get the path to the default client/server render
  // files.
  if (curDirectory === "JEST") {
    curDirectory = path.join(
      "file://",
      process.cwd(),
      "src/common/src/template/internal"
    );
  }

  // Use the built-in default rendering templates if none defined by the user
  const __filename = fileURLToPath(curDirectory);
  const __dirname = path.dirname(__filename);

  // Need to replace .tsx with .js since the file is compiled to the node_modules dist folder
  return [path.join(__dirname, globalFilename.split(".")[0] + ".js"), false];
};
