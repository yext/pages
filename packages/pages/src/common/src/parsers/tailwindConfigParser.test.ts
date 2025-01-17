import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  addThemeConfigToTailwind,
  tailwindConfigFilename,
} from "./tailwindConfigParser.js";

describe("addDataToPuckConfig", () => {
  it("should throw an error if the filepath is invalid", () => {
    expect(() => addThemeConfigToTailwind("invalid/filepath")).toThrow(
      'Filepath "invalid/filepath" is invalid.'
    );
  });

  it("correctly adds the theme config to the tailwind config", () => {
    try {
      fs.writeFileSync(
        tailwindConfigFilename,
        `import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./node_modules/@yext/visual-editor/dist/**/*.js",
  ],
  plugins: [],
} satisfies Config;
`
      );
      addThemeConfigToTailwind(tailwindConfigFilename);
      const modifiedContent = fs.readFileSync(tailwindConfigFilename, "utf-8");
      expect(modifiedContent).toContain(`theme: {
        extend: themeResolver({}, themeConfig)
    }`);
      expect(modifiedContent).toContain(
        `import { themeConfig } from "./theme.config";`
      );
      expect(modifiedContent).toContain(
        `import { themeResolver } from "@yext/visual-editor";`
      );
    } finally {
      if (fs.existsSync(tailwindConfigFilename)) {
        fs.unlinkSync(tailwindConfigFilename);
      }
    }
  });
});
