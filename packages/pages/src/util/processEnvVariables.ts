import { loadEnv } from "vite";

/**
 * Produces a map of environment variables filtered to those relevant
 * to the vite application, so environment variables can be accessed
 * without a runtime specific wrapping object.
 *
 * @param prefix string specifying the beginning of the keys to match
 */
export const processEnvVariables = (
  prefix = "VITE",
  // needed for templates and functions, but sourceFileParser double stringifies
  stringifyValues = true
): Record<string, string> => {
  const mode = process.env.NODE_ENV || "development";
  let processEnv = loadEnv(mode, process.cwd(), "");
  processEnv = Object.fromEntries(
    Object.entries(processEnv)
      .filter(([env]) => env.startsWith(prefix))
      .map(([key, value]) => [
        key,
        stringifyValues ? JSON.stringify(value) : value,
      ])
  );

  return processEnv;
};
