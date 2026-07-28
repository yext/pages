import { createHash } from "node:crypto";
import fs from "node:fs";

/**
 * Returns a stable hash of a file's contents for use in module cache keys.
 */
export const getFileContentHash = async (filepath: string): Promise<string> => {
  const contents = fs.readFileSync(filepath);
  return createHash("sha256").update(contents).digest("hex");
};
