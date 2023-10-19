import { describe, it, expect, vi } from "vitest";
import checkInstalled from "./checkInstalled.js";

let mockExec = (): string => {
  return "Yext CLI is installed";
};

vi.mock("child_process", () => {
  return {
    execSync: () => mockExec(),
  };
});

describe("checkInstalled", () => {
  it("checks if yext is installed", () => {
    expect(() => checkInstalled("yext version")).not.toThrowError();
  });

  it("throws error when yext is not installed", () => {
    mockExec = () => {
      throw new Error("Yext CLI not installed");
    };
    expect(() => checkInstalled("yext version")).toThrowError();
  });
});
