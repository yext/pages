import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { YextEnv, YEXT_ENVS } from "../../../common/src/template/types.js";
/**
 * Reads the "env" field from ~/.yext/current/active-credential (cross-platform).
 * Returns 'production' by default if file or field is missing or invalid.
 */
export function getEnvFromYextCredential(): YextEnv {
  const filePath = join(homedir(), ".yext", "current", "active-credential");

  try {
    if (!existsSync(filePath)) {
      console.warn(`Yext credential file not found at: ${filePath}`);
      return "production";
    }

    const content = readFileSync(filePath, "utf8");

    let data: Record<string, string>;
    try {
      data = JSON.parse(content);
    } catch (parseErr) {
      console.error(
        `Failed to parse JSON in ${filePath}:`,
        (parseErr as Error).message
      );
      return "production";
    }

    const env: string = data["env"];
    if ((YEXT_ENVS as readonly string[]).includes(env)) {
      return env as YextEnv;
    }

    console.warn(`Invalid "env" value in ${filePath}: ${env}`);
    return "production";
  } catch (err) {
    console.error(
      "Unexpected error while reading Yext credential: ",
      (err as Error).message
    );
    return "production";
  }
}
