import { Loader } from "esbuild";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import { pathToFileURL } from "url";
import path from "node:path";
import { processEnvVariables } from "../../../util/processEnvVariables.js";
import { anyFileLoader } from "./anyFileLoader.js";

export const COMMON_ESBUILD_LOADERS: { [ext: string]: Loader } = {
  ".css": "css",
  ".scss": "css",
  ".ico": "dataurl",
  ".avif": "dataurl",
  ".jpg": "dataurl",
  ".jpeg": "dataurl",
  ".png": "dataurl",
  ".gif": "dataurl",
  ".svg": "dataurl",
  ".webp": "dataurl",
  ".ttf": "dataurl",
  ".woff": "dataurl",
  ".woff2": "dataurl",
  ".otf": "dataurl",
};

export const BUILT_IN_ESBUILD_LOADERS: { [ext: string]: Loader } = {
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".jsx": "jsx",
  ".ts": "ts",
  ".mts": "ts",
  ".cts": "ts",
  ".tsx": "tsx",
};

const TEMP_DIR = ".temp";

export type ImportedModule = {
  path: string;
  module: any;
};

/**
 * Loads any files as modules.
 *
 * @param modulePaths the filepaths to load as modules
 * @param transpile set to true if the paths need to be transpiled (such as when they are in tsx format)
 * @returns Promise<{@link ImportedModule[]}>
 */
export const loadModules = async (
  modulePaths: string[],
  transpile: boolean
): Promise<ImportedModule[]> => {
  const importedModules: ImportedModule[] = [];
  for (const modulePath of modulePaths) {
    try {
      if (transpile) {
        const buildResult = await esbuild.build({
          entryPoints: [modulePath],
          outdir: TEMP_DIR,
          write: false,
          format: "esm",
          bundle: true,
          loader: COMMON_ESBUILD_LOADERS,
          define: processEnvVariables("YEXT_PUBLIC"),
          plugins: [anyFileLoader()],
        });

        // Get the template name and add a .js extension (ex: template.js)
        const baseFile = path.parse(modulePath).name + ".js";

        // Find the outputFile corresponding to the actual template file
        let templateOutputFile;
        for (const outputFile of buildResult.outputFiles) {
          if (path.parse(outputFile.path).base === baseFile) {
            templateOutputFile = outputFile;
            break;
          }
        }

        if (!templateOutputFile) {
          throw new Error(
            `Could not find outputFile in build result for file ${modulePath}.`
          );
        }

        importedModules.push({
          path: modulePath,
          module: await importFromString(templateOutputFile.text),
        });
      } else {
        importedModules.push({
          path: modulePath,
          module: await import(pathToFileURL(modulePath).toString()),
        });
      }
    } catch (e) {
      throw new Error(`Could not import ${modulePath} ${e}`);
    }
  }

  return importedModules;
};
