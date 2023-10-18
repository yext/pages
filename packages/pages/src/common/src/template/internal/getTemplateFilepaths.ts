import React from "react";
import { globSync } from "glob";
import path from "path";
import { Path } from "../../project/path.js";
import { ProjectStructure } from "../../project/structure.js";
import { ClientServerRenderTemplates } from "../types.js";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { convertToPosixPath } from "../paths.js";

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
  return getTemplateFilepaths(projectStructure.getTemplatePaths());
};

const globalClientRenderFilename17 = "_client17.tsx";
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
  templatePaths: Path[]
): ClientServerRenderTemplates => {
  const shouldUseReactRoot = parseInt(React.version) >= 18;

  const [clientRenderTemplatePath, usingCustomClient] = findGlobalRenderFile(
    templatePaths,
    shouldUseReactRoot
      ? globalClientRenderFilename
      : globalClientRenderFilename17
  );
  const [serverRenderTemplatePath, usingCustomServer] = findGlobalRenderFile(
    templatePaths,
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
  templatePaths: Path[],
  globalFilename: string
): [string, boolean] => {
  const pathToGlobalFile = path.join(
    templatePaths[0].getAbsolutePath(),
    globalFilename
  );

  if (fs.existsSync(pathToGlobalFile)) {
    return [pathToGlobalFile, true];
  }

  // Use the built-in default rendering templates if none defined by the user
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Need to replace .tsx with .js since the file is compiled to the node_modules dist folder
  return [path.join(__dirname, globalFilename.split(".")[0] + ".js"), false];
};
