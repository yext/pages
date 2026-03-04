import path from "node:path";

/**
 * Normalizes a subpath used for output file naming so it stays relative
 * and cannot escape the output directory. Falls back for empty or unsafe inputs.
 */
export const sanitizeSubpath = (value: string, fallback: string): string => {
  const normalizeCandidate = (input: string): string => {
    const trimmed = input.trim();
    const withoutDrive = trimmed.replace(/^[a-zA-Z]:/, "");
    const withoutLeading = withoutDrive.replace(/^[/\\]+/, "");
    return path.posix.normalize(withoutLeading.replace(/\\/g, "/")).replace(/^(\.\/)+/, "");
  };

  const normalizedFallback = normalizeCandidate(fallback);
  if (
    normalizedFallback === "" ||
    normalizedFallback === "." ||
    normalizedFallback.startsWith("..")
  ) {
    throw new Error(`Invalid sanitizeSubpath fallback: ${fallback}`);
  }

  const normalized = normalizeCandidate(value);
  if (normalized === "" || normalized === "." || normalized.startsWith("..")) {
    return normalizedFallback;
  }

  return normalized;
};
