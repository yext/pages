import fs from "fs";
import YAML from "yaml";

const validUniverses = ["sandbox", "production", "sbx", "prod", "qa", "dev"];

/**
 * Parses the contents of the .yextrc file and returns the
 * current user's accountId and universe, if valid.
 * If the file cannot be read, or either the accountId or
 * universe is invalid, both will be returned as undefined.
 *
 * @public
 */
export const parseYextrcContents = (scope: string | undefined = undefined) => {
  let accountId: string | undefined;
  let universe: string | undefined;
  try {
    const yextrcContents: string = fs.readFileSync(".yextrc", "utf8");
    const parsedContents = YAML.parse(yextrcContents);
    if (scope && parsedContents[scope]) {
      const scopedContents = parsedContents[scope];
      accountId = !isNaN(Number(scopedContents.accountId)) ? scopedContents.accountId : undefined;
      universe = validUniverses.includes(scopedContents.universe)
        ? scopedContents.universe
        : undefined;
    } else if (
      !scope &&
      !isNaN(Number(parsedContents.accountId)) &&
      validUniverses.includes(parsedContents.universe)
    ) {
      accountId = parsedContents.accountId;
      universe = parsedContents.universe;
    }
  } catch (_) {
    // Return undefined for both fields if .yextrc cannot be read
  }
  return { accountId, universe };
};
