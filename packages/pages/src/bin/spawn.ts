#!/usr/bin/env node
import { spawnSync } from "child_process";

console.log("spawning");

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

console.log("done spawning");
