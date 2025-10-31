const API_BASE_PROD = "https://api.yext.com/v2/accounts/me/";
const API_BASE_SBX = "https://api-sandbox.yext.com/v2/accounts/me/";
const API_BASE_EU = "https://api.eu.yext.com/v2/accounts/me/";

/**
 * Resolves the API base URL based on partition and environment.
 * Normalizes environment values (supports both "prod"/"production" and "sbx"/"sandbox").
 *
 * @param partition - The partition ("US" or "EU")
 * @param env - The environment ("prod" | "production" | "sbx" | "sandbox")
 * @returns The API base URL string
 * @throws Error if EU partition is used with a non-production environment
 */
export function resolveApiBase(partition: "US" | "EU", env: string): string {
  // Normalize environment values
  const isProduction = env === "prod" || env === "production";
  const isSandbox = env === "sbx" || env === "sandbox";

  switch (partition) {
    case "EU":
      if (!isProduction) {
        throw new Error("EU partition only supports production environment");
      }
      return API_BASE_EU;
    case "US":
    default:
      return isSandbox ? API_BASE_SBX : API_BASE_PROD;
  }
}
