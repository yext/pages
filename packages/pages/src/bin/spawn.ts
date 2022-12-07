#!/usr/bin/env node
import { spawnSync } from "child_process";
import process from "process";
import path from "path";

console.log("spawning!");

const pathToPagesScript = path.resolve(
  process.cwd(),
  "node_modules",
  "@yext",
  "pages",
  "dist",
  "bin",
  "pages.js"
);
console.log(process.cwd(), pathToPagesScript);

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

console.log("done spawning");
