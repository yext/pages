import path from "node:path";

/**
 * Normalizes a subpath used for output file naming so it stays relative
 * and cannot escape the output directory. Falls back for empty or unsafe inputs.
 */
export const sanitizeSubpath = (value: string, fallback: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallback;
  }

  const withoutDrive = trimmed.replace(/^[a-zA-Z]:/, "");
  const withoutLeading = withoutDrive.replace(/^[/\\]+/, "");
  const normalized = path.posix
    .normalize(withoutLeading.replace(/\\/g, "/"))
    .replace(/^(\.\/)+/, "");

  if (normalized === "" || normalized === "." || normalized.startsWith("..")) {
    return fallback;
  }

  return normalized;
};
