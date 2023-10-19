import { describe, it, expect } from "vitest";
import { getPartition } from "./partition.js";

describe("getPartition", () => {
  it("gets the partition for a US accountId", () => {
    const partition = getPartition(1089287);
    expect(partition).toEqual("US");
  });

  it("gets the partition for an EU accountId", () => {
    const partition = getPartition(100001234);
    expect(partition).toEqual("EU");
  });

  it("returns nothing for an invalid accountId", () => {
    const partition = getPartition(1234567890);
    expect(partition).toEqual("");
  });
});
