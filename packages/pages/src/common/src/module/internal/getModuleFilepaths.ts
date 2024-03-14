import { globSync } from "glob";
import path from "path";
import { Path } from "../../project/path.js";
import { convertToPosixPath } from "../../template/paths.js";
import { ProjectStructure } from "../../project/structure.js";
import { readdirSync } from "fs";
import { getReactVersion } from "../../template/internal/util.js";
import { ModuleClientServerRenderTemplates } from "../types.js";
import { fileURLToPath } from "url";

/**
 * Get all the module files in the provided module folder path(s).
 *
 * If there are files that share the same name between the provided
 * module folder paths, only the file found in the first visited path
 * from the list is included.
 *
 * @param paths a list of paths to collect module files from
 * @returns a list of module filepaths
 */
export const getModuleFilepaths = (paths: Path[]): string[] => {
  const moduleFilePaths: string[] = [];
  const addedFilenames: Set<string> = new Set();
  paths.forEach((p) => {
    readdirSync(p.getAbsolutePath(), { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)
      .forEach((dir) => {
        const filePaths = globSync(
          convertToPosixPath(`${p.getAbsolutePath()}/${dir}/*.tsx`)
        );
        if (filePaths.length != 1) {
          console.error(
            `Multiple or no source files found for module "${dir}". There must be one .tsx file per module.`
          );
        }
        const filePath = filePaths[0];
        const fileName = path.basename(filePath);
        if (!addedFilenames.has(fileName)) {
          addedFilenames.add(fileName);
          moduleFilePaths.push(filePath);
        }
      });
  });

  return moduleFilePaths;
};

export const getModuleFilepathsFromProjectStructure = (
  projectStructure: ProjectStructure
): string[] => {
  return getModuleFilepaths(projectStructure.getModulePaths());
};

const globalClientRenderFilename17 = "_client17.tsx";
const globalClientRenderFilename = "_client.tsx";
const globalServerRenderFilename = "_server.tsx";

export const getGlobalClientServerRenderModules =
  (): ModuleClientServerRenderTemplates => {
    const shouldUseReactRoot = getReactVersion() >= 18;

    const clientRenderTemplatePath = findGlobalRenderFile(
      shouldUseReactRoot
        ? globalClientRenderFilename
        : globalClientRenderFilename17
    );
    const serverRenderTemplatePath = findGlobalRenderFile(
      globalServerRenderFilename
    );

    return {
      clientRenderTemplatePath,
      serverRenderTemplatePath,
    };
  };

/**
 * @param defaultFilename the name of the provided file to use
 * @returns the path to the appropriate file along with a boolean denoting if the path returned is a custom render template
 */
const findGlobalRenderFile = (defaultFilename: string): string => {
  // Use the built-in default rendering templates if none defined by the user
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Need to replace .tsx with .js since the file is compiled to the node_modules dist folder
  return path.join(__dirname, defaultFilename.split(".")[0] + ".js");
};
