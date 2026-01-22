import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { addDataToPuckConfig } from "./puckConfigParser.js";

describe("addDataToPuckConfig", () => {
  it("should throw an error if the filepath is invalid", () => {
    expect(() => addDataToPuckConfig("fileName", "invalid/filepath")).toThrow(
      'Filepath "invalid/filepath" is invalid.'
    );
  });

  it("correctly adds new config to the puck config file", () => {
    try {
      fs.writeFileSync(
        "test.tsx",
        `export const componentRegistry = new Map<string, Config<any>>([
          ["location", locationConfig],
        ]);`
      );
      addDataToPuckConfig("foo", "test.tsx");
      const modifiedContent = fs.readFileSync("test.tsx", "utf-8");
      expect(modifiedContent).toContain('["foo", fooConfig]');
      expect(modifiedContent).toContain(`export const fooConfig: Config<FooProps>`);
    } finally {
      if (fs.existsSync("test.tsx")) {
        fs.unlinkSync("test.tsx");
      }
    }
  });
});
