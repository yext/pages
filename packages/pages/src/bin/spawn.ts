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

const pathToLoader = path.resolve(
  process.cwd(),
  "node_modules",
  "@yext",
  "pages",
  "dist",
  "bin",
  "loader.js"
);

const nodeVersion = Number(
  spawnSync("node", ["-v"], { encoding: "utf-8" })
    .stdout.substring(1)
    .split(".")[0]
);

const experimentalFlags = ["--experimental-vm-modules"];
if (nodeVersion === 17 || nodeVersion === 18) {
  experimentalFlags.push("--experimental-specifier-resolution=node");
} else {
  experimentalFlags.push("--experimental-loader");
  experimentalFlags.push(pathToLoader);
}

spawnSync(
  "node",
  [...experimentalFlags, pathToPagesScript, ...process.argv.slice(2)],
  {
    stdio: "inherit",
  }
);
