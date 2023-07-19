import fs from "fs";
import YAML from "yaml";
import { logErrorAndExit } from "./logError.js";

const validUniverses = ["sandbox", "production", "sbx", "prod", "qa", "dev"];

/**
 * Parses the contents of the .yextrc file and returns the
 * current user's accountId and universe, if valid.
 *
 * @public
 */
export const parseYextrcContents = () => {
  const yextrcContents: string = fs.readFileSync(".yextrc", "utf8");
  const parsedContents = YAML.parse(yextrcContents);
  const accountId: string = parsedContents.accountId;
  const universe: string = parsedContents.universe;
  if (isNaN(Number(accountId))) {
    logErrorAndExit("Invalid Account ID format in .yextrc file.");
  }
  if (!validUniverses.includes(universe)) {
    logErrorAndExit("Invalid Universe in .yextrc file.");
  }
  return { accountId, universe };
};
