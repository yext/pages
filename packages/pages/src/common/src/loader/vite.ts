import { InlineConfig, createLogger, createServer } from "vite";
import { ProjectStructure } from "../project/structure.js";
import { processEnvVariables } from "../../../util/processEnvVariables.js";
import { pathToFileURL } from "node:url";
import { loadViteModule } from "../../../dev/server/ssr/loadViteModule.js";
import { scopedViteConfigPath } from "../../../util/viteConfig.js";
import { createModuleLogger } from "../module/internal/logger.js";

export const getViteServerConfig = (projectStructure: ProjectStructure): InlineConfig => {
  return {
    configFile: scopedViteConfigPath(projectStructure.config.scope),
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    envDir: projectStructure.config.envVarConfig.envVarDir,
    envPrefix: projectStructure.config.envVarConfig.envVarPrefix,
    define: processEnvVariables(projectStructure.config.envVarConfig.envVarPrefix),
    optimizeDeps: {
      include: ["react-dom", "react-dom/client"],
    },
    customLogger: createModuleLogger(),
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
    const customLogger = createLogger();
    const customLoggerError = customLogger.error;
    customLogger.error = (msg, options) => {
      // See https://github.com/vitejs/vite/issues/14328
      if (msg.includes("WebSocket server error: Port is already in use")) {
        return;
      }
      customLoggerError(msg, options);
    };

    const vite = await createServer({
      ...getViteServerConfig(projectStructure),
      customLogger: customLogger,
    });

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
        module: await import(pathToDecodedFileURL(modulePath)),
      });
    }
  }

  return importedModules;
};

/**
 * Node 22 changed pathToFileUrl to automatically encode characters that are not valid in URLs,
 * while earlier versions did not. This function decodes the file URL to match the behavior of
 * earlier versions.
 */
const pathToDecodedFileURL = (path: string): string => {
  const fileUrlString = pathToFileURL(path).toString();
  const decodedFileUrlString = decodeURI(fileUrlString);
  return decodedFileUrlString.slice(7); // Remove "file://"
};
