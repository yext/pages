#!/usr/bin/env node
import { spawnSync } from "child_process";
import process from "process";
import path from "path";

const pathToPagesScript = path.resolve(
  process.cwd(),
  "node_modules",
  "@yext",
  "pages",
  "dist",
  "bin",
  "pages.js"
);

spawnSync(
  "node",
  [
    "--experimental-specifier-resolution=node",
    "--experimental-vm-modules",
    pathToPagesScript,
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
  }
);
