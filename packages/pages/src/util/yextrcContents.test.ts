import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseYextrcContents } from "./yextrcContents.js";

describe("parseYextrcContents", () => {
  it("returns a valid accountId and universe from .yextrc", () => {
    const providedAccountId = 1089287;
    const providedUniverse = "prod";
    fs.writeFileSync(".yextrc", `accountId: ${providedAccountId}\nuniverse: ${providedUniverse}`);
    const { accountId, universe } = parseYextrcContents();

    expect(accountId).toEqual(providedAccountId);
    expect(universe).toEqual(providedUniverse);
  });

  it("returns nothing when the accountId provided in .yextrc in invalid", () => {
    const providedAccountId = "invalidAccountId";
    const providedUniverse = "prod";
    fs.writeFileSync(".yextrc", `accountId: ${providedAccountId}\nuniverse: ${providedUniverse}`);
    const { accountId, universe } = parseYextrcContents();

    expect(accountId).toBeFalsy();
    expect(universe).toBeFalsy();
  });

  it("returns nothing when the universe provided in .yextrc in invalid", () => {
    const providedAccountId = "invalidAccountId";
    const providedUniverse = "fakeUniverse";
    fs.writeFileSync(".yextrc", `accountId: ${providedAccountId}\nuniverse: ${providedUniverse}`);
    const { accountId, universe } = parseYextrcContents();

    expect(accountId).toBeFalsy();
    expect(universe).toBeFalsy();
  });

  it("returns nothing when .yextrc does not exist", () => {
    fs.unlink(".yextrc", () => {});
    const { accountId, universe } = parseYextrcContents();

    expect(accountId).toBeFalsy();
    expect(universe).toBeFalsy();
  });
});
