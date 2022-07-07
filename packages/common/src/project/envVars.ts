/**
 * The directory, relative to the root of the user's site that
 * will house all the .env files which define env vars.
 *
 * @private
 */
export const ENV_VAR_DIR = "env";

/**
 * If this prefix is prepended to an env vars name, then it will
 * be considered public. This means that at build time it will be
 * inline replaced in the code with the value of the env var and
 * accessible in the user's browser.
 *
 * @private
 */
export const ENV_VAR_PUBLIC_PREFIX = "YEXT_PUBLIC";
