import { ServerlessFunctionModule } from "../types.js";
import {
  convertServerlessFunctionModuleToServerlessFunctionModuleInternal,
  ServerlessFunctionModuleInternal,
} from "./types.js";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import { pathToFileURL } from "url";

const TEMP_DIR = ".temp";

/**
 * Loads all serverless functions in the project.
 *
 * @param serverlessFunctionModulePaths the serverless function filepaths to load as modules
 * @param transpile set to true if the serverless functions need to be transpiled (such as when they are in tsx format)
 * @param adjustForFingerprintedAsset removes the fingerprint portion (for server bundles)
 * @returns Promise<{@link ServerlessFunctionModuleCollection}>
 */
export const loadServerlessFunctionModules = async (
  serverlessFunctionModulePaths: string[],
  transpile: boolean,
  adjustForFingerprintedAsset: boolean
): Promise<ServerlessFunctionModuleCollection> => {
  const importedModules = [] as ServerlessFunctionModuleInternal<any, any>[];
  for (const serverlessFunctionModulePath of serverlessFunctionModulePaths) {
    let serverlessFunctionModule = {} as ServerlessFunctionModule<any, any>;
    try {
      if (transpile) {
        const buildResult = await esbuild.build({
          entryPoints: [serverlessFunctionModulePath],
          outdir: TEMP_DIR,
          write: false,
          format: "esm",
          bundle: true,
          loader: {
            ".ico": "dataurl",
          },
        });

        serverlessFunctionModule = await importFromString(
          buildResult.outputFiles[0].text
        );
      } else {
        serverlessFunctionModule = await import(
          pathToFileURL(serverlessFunctionModulePath).toString()
        );
      }
    } catch (e) {
      throw new Error(`Could not import ${serverlessFunctionModulePath} ${e}`);
    }

    const serverlessFunctionModuleInternal =
      convertServerlessFunctionModuleToServerlessFunctionModuleInternal(
        serverlessFunctionModulePath,
        serverlessFunctionModule,
        adjustForFingerprintedAsset
      );

    importedModules.push({
      ...serverlessFunctionModuleInternal,
      path: serverlessFunctionModulePath,
    });
  }

  return importedModules.reduce((prev, module) => {
    if (prev.has(module.config.name)) {
      throw new Error(
        `Serverless Functions must have unique feature names. Found multiple modules with "${module.config.name}"`
      );
    }
    if (prev.has(module.slug)) {
      throw new Error(
        `Serverless Functions must have unique slugs. Found multiple modules with "${module.slug}"`
      );
    }
    return prev.set(module.slug, module);
  }, new Map());
};

// A ServerlessFunctionModuleCollection is a collection of serverless function modules indexed by
// feature name.
export type ServerlessFunctionModuleCollection = Map<
  string,
  ServerlessFunctionModuleInternal<any, any>
>;
