import { pathToFileURL } from "node:url";
import { getFileContentHash } from "../../../util/fileContentHash.js";

/**
 * Returns a file URL versioned with a stable hash of its contents.
 */
export const versionedFileUrl = async (filepath: string): Promise<string> => {
  const moduleUrl = pathToFileURL(filepath);
  moduleUrl.searchParams.set("contentHash", await getFileContentHash(filepath));
  return moduleUrl.href;
};

/**
 * A custom import function so that it can be mocked in tests.
 */
export const import_ = async (filepath: string) => {
  return await import(filepath);
};
