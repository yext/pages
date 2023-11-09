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

  // If we're development return all env var keys, otherwise use Vite's default
  // way of loading env vars in prod.
  // For prod, only public env vars are loaded since they are statically replaced in code.
  // Cog makes the non-public env vars available as global vars in the Deno
  // runtime context.
  prefix = mode === "development" ? "" : prefix;

  return Object.fromEntries(
    Object.entries(loadEnv(mode, process.cwd(), prefix)).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ])
  );
};
