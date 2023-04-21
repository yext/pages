import type { PlaywrightTestConfig } from "@playwright/test";
import base from "../playwright.config.js";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  ...base,
  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev -- --no-open-browser",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
