import { getPartition } from "./partition.js";

describe("getPartition", () => {
  it("get partition for a US accountId", () => {
    const partition = getPartition(1089287);
    expect(partition).toEqual("US");
  });

  it("get partition for an EU accountId", () => {
    const partition = getPartition(100001234);
    expect(partition).toEqual("EU");
  });

  it("get partition for an invalid accountId", () => {
    const partition = getPartition(1234567890);
    expect(partition).toEqual("");
  });
});
