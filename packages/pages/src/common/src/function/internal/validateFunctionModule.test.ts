import { describe, it, expect } from "vitest";
import { HttpFunction } from "../types.js";
import { validateFunctionModule } from "./validateFunctionModule.js";

const exampleFunction: HttpFunction = () => {
  return { body: "Hello World", headers: {}, statusCode: 200 };
};

describe("validateFunctionModule (check for default export)", () => {
  it("throws an error when there is no default export", () => {
    expect(async () =>
      validateFunctionModule("mock/file/path", { default: undefined })
    ).rejects.toThrow("mock/file/path is missing a default export.");
  });

  it("does not throw an error when there is a default export", () => {
    expect(() =>
      validateFunctionModule("mock/file/path", { default: exampleFunction })
    ).not.toThrow();
  });
});
