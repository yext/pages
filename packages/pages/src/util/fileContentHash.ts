import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Returns a stable hash of a file's contents for use in module cache keys.
 */
export const getFileContentHash = async (filepath: string): Promise<string> => {
  const contents = await readFile(filepath);
  return createHash("sha256").update(contents).digest("hex");
};
