import fs from "node:fs";

/**
 * Returns a stable hash of a file's contents for use in module cache keys.
 */
export const getFileContentHash = async (filepath: string): Promise<string> => {
  const contents = new TextEncoder().encode(fs.readFileSync(filepath, "utf-8"));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", contents);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};
