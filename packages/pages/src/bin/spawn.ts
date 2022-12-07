#!/usr/bin/env node
import { spawnSync } from "child_process";

spawnSync(
  "node",
  [
    "--experimental-specifier-resolution=node",
    "--experimental-vm-modules",
    "node_modules/@yext/pages/dist/bin/pages.js",
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
  }
);
