#!/usr/bin/env node
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import process from "process";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPagesScript = path.resolve(__dirname, "./pages.js");

const results = spawnSync(
  "node",
  [pathToPagesScript, ...process.argv.slice(2)],
  {
    stdio: "inherit",
  }
);

if (results?.status != undefined && results.status !== 0) {
  process.exitCode = results.status;
}
