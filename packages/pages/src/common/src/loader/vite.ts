import { InlineConfig, createServer } from "vite";
import { ProjectStructure } from "../project/structure.js";
import { processEnvVariables } from "../../../util/processEnvVariables.js";
import { pathToFileURL } from "node:url";
import { loadViteModule } from "../../../dev/server/ssr/loadViteModule.js";

export const getViteServerConfig = (
  projectStructure: ProjectStructure
): InlineConfig => {
  return {
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    envDir: projectStructure.config.envVarConfig.envVarDir,
    envPrefix: projectStructure.config.envVarConfig.envVarPrefix,
    define: processEnvVariables(
      projectStructure.config.envVarConfig.envVarPrefix
    ),
    optimizeDeps: {
      include: ["react-dom", "react-dom/client"],
    },
  };
};

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
  transpile: boolean,
  projectStructure: ProjectStructure
): Promise<ImportedModule[]> => {
  const importedModules: ImportedModule[] = [];

  if (transpile) {
    // Note that this will log inconsequential errors
    // See https://github.com/vitejs/vite/issues/14328
    const vite = await createServer(getViteServerConfig(projectStructure));

    for (const modulePath of modulePaths) {
      const functionModule = await loadViteModule(vite, modulePath);

      importedModules.push({
        path: modulePath,
        module: functionModule,
      });
    }

    await vite.close();
  } else {
    for (const modulePath of modulePaths) {
      importedModules.push({
        path: modulePath,
        module: await import(pathToFileURL(modulePath).toString()),
      });
    }
  }

  return importedModules;
};
