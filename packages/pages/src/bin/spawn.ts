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

const results = spawnSync(
  "node",
  ["--experimental-vm-modules", pathToPagesScript, ...process.argv.slice(2)],
  {
    stdio: "inherit",
  }
);

if (results?.status != undefined && results.status !== 0) {
  process.exitCode = results.status;
}
