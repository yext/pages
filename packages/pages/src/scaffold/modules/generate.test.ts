import { describe, it, expect } from "vitest";
import { isValidModuleName } from "./generate.js";

describe("isValidModuleName", () => {
  const testCases = [
    { moduleName: "foo123", expected: true },
    { moduleName: "foo-bar123", expected: true },
    { moduleName: "foo_bar", expected: true },
    { moduleName: "foo$bar", expected: true },
    { moduleName: "foobar-_$", expected: true },
    { moduleName: "$foo", expected: false },
    { moduleName: "!foo", expected: false },
    { moduleName: "1foo", expected: false },
    { moduleName: "$foo", expected: false },
    { moduleName: "foo*", expected: false },
    { moduleName: "foo(bar)", expected: false },
    { moduleName: "foo bar", expected: false },
  ];

  testCases.forEach(({ moduleName, expected }) => {
    it(`returns ${expected} for input: ${moduleName}`, async () => {
      const result = isValidModuleName(moduleName);
      expect(result).toBe(expected);
    });
  });
});
