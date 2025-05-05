import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { YextEnv } from "../../../common/src/template/types.js";
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

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (parseErr) {
      console.error(
        `Failed to parse JSON in ${filePath}:`,
        (parseErr as Error).message
      );
      return "production";
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "env" in data &&
      typeof (data as any).env === "string"
    ) {
      const env = (data as { env: string }).env as string;

      const validEnvs: YextEnv[] = [
        "development",
        "qa",
        "sandbox",
        "production",
      ];
      if (validEnvs.includes(env as YextEnv)) {
        return env as YextEnv;
      }

      console.warn(`Invalid "env" value in ${filePath}: ${env}`);
    } else {
      console.warn(`"env" field not found in: ${filePath}`);
    }
  } catch (err) {
    console.error(
      "Unexpected error while reading Yext credential:",
      (err as Error).message
    );
  }

  return "production";
}
