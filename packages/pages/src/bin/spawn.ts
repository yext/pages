#!/usr/bin/env node
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import process from "process";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPagesScript = path.resolve(__dirname, "./pages.js");

// Keeping this unused function in case it's needed again
// eslint-disable-next-line no-unused-vars
const nodeVersion = Number(
  spawnSync("node", ["-v"], { encoding: "utf-8" }).stdout.substring(1).split(".")[0]
);

const experimentalFlags = ["--experimental-vm-modules"];

const results = spawnSync(
  "node",
  [...experimentalFlags, pathToPagesScript, ...process.argv.slice(2)],
  {
    stdio: "inherit",
  }
);

if (results?.status != undefined && results.status !== 0) {
  process.exitCode = results.status;
}
