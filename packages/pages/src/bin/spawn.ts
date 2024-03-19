#!/usr/bin/env node
import { spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import process from "process";
import path from "path";
import { register } from "node:module";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePrefix = path.sep === path.win32.sep ? "file:\\\\" : "";
const pathToPagesScript = path.resolve(__dirname, "./pages.js");
const pathToLoader = filePrefix + path.resolve(__dirname, "./loader.js");

const nodeVersion = Number(
  spawnSync("node", ["-v"], { encoding: "utf-8" })
    .stdout.substring(1)
    .split(".")[0]
);

const experimentalFlags = ["--experimental-vm-modules"];
if (nodeVersion === 18) {
  experimentalFlags.push("--experimental-specifier-resolution=node");
} else {
  const loaderURL = pathToFileURL(pathToLoader).href;
  console.log("test (to remove): " + loaderURL.toString());
  register(loaderURL);
}

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
