import { loadEnv } from "vite";

/**
 * Produces a map of environment variables filtered to those relevant
 * to the vite application, so environment variables can be accessed
 * without a runtime specific wrapping object.
 *
 * @param prefix string specifying the beginning of the keys to match
 */
export const processEnvVariables = (
  prefix = "VITE"
): Record<string, string> => {
  const mode = process.env.NODE_ENV || "development";

  // If we're in development return all env var keys, otherwise use Vite's default
  // way of loading env vars in prod.
  // For prod, only public env vars are loaded since they are statically replaced in code.
  // Cog makes the non-public env vars available as global vars in the Deno
  // runtime context.
  prefix = mode === "development" ? "" : prefix;

  return Object.fromEntries(
    Object.entries(loadEnv(mode, process.cwd(), prefix))
      // For some reason this env var is automatically set and causes issues in Linux so
      // we filter it out specifically.
      .filter(([env]) => env !== "_")
      // Filter out function keys as they cause problems with esbuild. For example, the
      // key `'BASH_FUNC_protosearch%%'`, which is an exported function, results in the error:
      // The define key "BASH_FUNC_protosearch%%" must be a valid identifier
      .filter(([env]) => isIdentifier(env))
      // The value must be stringified: https://vitejs.dev/config/shared-options.html#define
      .map(([key, value]) => [key, JSON.stringify(value)])
  );
};

const startRunes = "_$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const continueRunes =
  "_$0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Partially translated from https://github.com/evanw/esbuild which is ultimately
// what's used to validate define keys. The difference with this function is that
// it does not handle unicode characters and does some basic rune comparisons.
const isIdentifier = (text: string): boolean => {
  if (text.length === 0) {
    return false;
  }

  let i = 0;
  for (const rune of text) {
    if (i === 0) {
      if (!startRunes.includes(rune)) {
        return false;
      }
    } else {
      if (!continueRunes.includes(rune)) {
        return false;
      }
    }
    i++;
  }

  return true;
};
