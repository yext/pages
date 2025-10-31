const YEXT_API_US_PROD = "https://api.yext.com/v2/accounts/me/";
const YEXT_API_US_SBX = "https://api-sandbox.yext.com/v2/accounts/me/";
const YEXT_API_EU_PROD = "https://api.eu.yext.com/v2/accounts/me/";

/**
 * Resolves the API base URL based on partition and environment.
 * Normalizes environment values (supports both "prod"/"production" and "sbx"/"sandbox").
 *
 * @param partition - The partition ("US" or "EU")
 * @param env - The environment ("prod" | "production" | "sbx" | "sandbox")
 * @returns The API base URL string
 * @throws Error if EU partition is used with a non-production environment
 */
export function resolveApiBase(
  partition: "US" | "EU",
  env: "prod" | "production" | "sbx" | "sandbox"
): string {
  // Normalize environment values
  const isProduction = env === "prod" || env === "production";
  const isSandbox = env === "sbx" || env === "sandbox";

  if (isProduction) {
    return partition === "EU" ? YEXT_API_EU_PROD : YEXT_API_US_PROD;
  }
  if (isSandbox) {
    if (partition === "EU") {
      throw new Error("EU partition only supports production environment");
    }
    return YEXT_API_US_SBX;
  }
  // Default fallback for any unrecognized env value
  return YEXT_API_US_PROD;
}
