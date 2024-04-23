import { describe, it, expect } from "vitest";
import { formatModuleName } from "./templates.js";

describe("formatModuleName", () => {
  const testCases = [
    { moduleName: "foo123", expected: "Foo123" },
    { moduleName: "foo-bar123", expected: "FooBar123" },
    { moduleName: "foo_bar", expected: "Foo_bar" },
    { moduleName: "foo$bar", expected: "Foo$bar" },
    { moduleName: "foobar-_$", expected: "Foobar_$" },
  ];

  testCases.forEach(({ moduleName, expected }) => {
    it(`returns ${expected} for input: ${moduleName}`, async () => {
      const result = formatModuleName(moduleName);
      expect(result).toBe(expected);
    });
  });
});
