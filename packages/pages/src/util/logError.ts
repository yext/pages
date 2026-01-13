import colors from "picocolors";
import { ProjectStructure } from "../common/src/project/structure.js";
import { removeHydrationClientFiles } from "../common/src/template/client.js";

/**
 * Logs the provided error and exits the program.
 *
 * @param error The error to log
 *
 * @public
 */
export const logErrorAndExit = (error: string | any) => {
  logError(error);
  process.exit(1);
};

export const logError = (error: string | any) => {
  console.error(colors.red(`ERROR: ${error}`));
};

export const logWarning = (warning: string) => {
  console.warn(colors.yellow(`WARNING: ${warning}`));
};

export const logErrorAndClean = async (error: string | any, projectStructure: ProjectStructure) => {
  await removeHydrationClientFiles(projectStructure);
  logErrorAndExit(error);
};
