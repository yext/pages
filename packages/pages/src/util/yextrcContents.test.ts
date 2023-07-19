import fs from "fs";
import { parseYextrcContents } from "./yextrcContents.js";

describe("parseYextrcContents", () => {
  it("parse valid accountId and universe from .yextrc", () => {
    const providedAccountId = 1089287;
    const providedUniverse = "prod";
    fs.writeFileSync(
      ".yextrc",
      `accountId: ${providedAccountId}\nuniverse: ${providedUniverse}`
    );

    const { accountId, universe } = parseYextrcContents();

    expect(accountId).toEqual(providedAccountId);
    expect(universe).toEqual(providedUniverse);
  });
});
