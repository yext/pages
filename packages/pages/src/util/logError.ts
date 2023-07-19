import colors from "picocolors";

/**
 * Logs the provided error and exits the program.
 *
 * @param error The error to log
 *
 * @public
 */
export const logErrorAndExit = (error: string | any) => {
  console.error(colors.red("ERROR: ") + error);
  process.exit(1);
};
