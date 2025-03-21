import path from "node:path";
import { Path } from "../../project/path.js";
import { ProjectStructure } from "../../project/structure.js";
import { ClientServerRenderTemplates } from "../types.js";
import { fileURLToPath } from "node:url";
import { convertToPosixPath } from "../paths.js";
import { existsSync, getReactVersion, globSync } from "./util.js";

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
    const filepaths = globSync(
      convertToPosixPath(`${p.getAbsolutePath()}/*.{tsx,jsx,js,ts}`)
    );
    filepaths
      // Don't include the client/server rendering templates
      .filter(
        (f) =>
          f.indexOf(globalClientRenderFilename) === -1 &&
          f.indexOf(globalServerRenderFilename) === -1 &&
          f.indexOf(globalHydrationClientFilename) === -1
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
  return getTemplateFilepaths(projectStructure.getTemplatePaths());
};

const globalClientRenderFilename17 = "_client17.tsx";
const globalClientRenderFilename = "_client.tsx";
const globalServerRenderFilename = "_server.tsx";
const globalHydrationClientFilename = ".client";

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
  templatePaths: Path[]
): ClientServerRenderTemplates => {
  const shouldUseReactRoot = getReactVersion() >= 18;

  const [clientRenderTemplatePath, usingCustomClient] = findGlobalRenderFile(
    templatePaths,
    globalClientRenderFilename,
    shouldUseReactRoot
      ? globalClientRenderFilename
      : globalClientRenderFilename17
  );
  const [serverRenderTemplatePath, usingCustomServer] = findGlobalRenderFile(
    templatePaths,
    globalServerRenderFilename,
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
 * @param globalFilename the file to find
 * @param defaultFilename the name of the provided file if globalFilename cannot be found - necessary for _client.js vs _client17.js
 * @returns the path to the appropriate file along with a boolean denoting if the path returned is a custom render template
 */
const findGlobalRenderFile = (
  templatePaths: Path[],
  globalFilename: string,
  defaultFilename: string
): [string, boolean] => {
  if (templatePaths.length > 0) {
    const pathToGlobalFile = path.join(
      templatePaths[0].getAbsolutePath(),
      globalFilename
    );

    if (existsSync(pathToGlobalFile)) {
      return [pathToGlobalFile, true];
    }
  }

  // Use the built-in default rendering templates if none defined by the user
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Need to replace .tsx with .js since the file is compiled to the node_modules dist folder
  return [path.join(__dirname, defaultFilename.split(".")[0] + ".js"), false];
};
