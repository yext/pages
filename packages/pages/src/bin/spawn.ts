#!/usr/bin/env node
import { spawnSync } from "child_process";

console.log("spawny");
spawnSync(
  "node" +
    " --experimental-specifier-resolution=node" +
    " --experimental-vm-modules" +
    " node_modules/@yext/pages/dist/bin/pages.js" +
    ' "$@"'
);
