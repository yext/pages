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
  switch (partition) {
    case "EU":
      switch (env) {
        case "prod":
        case "production":
          return YEXT_API_EU_PROD;
        case "sbx":
        case "sandbox":
        default:
          throw new Error("EU partition only supports production environment");
      }
    case "US":
    default:
      switch (env) {
        case "prod":
        case "production":
          return YEXT_API_US_PROD;
        case "sbx":
        case "sandbox":
          return YEXT_API_US_SBX;
        default:
          throw new Error(`Unhandled environment: ${env}`);
      }
  }
}
