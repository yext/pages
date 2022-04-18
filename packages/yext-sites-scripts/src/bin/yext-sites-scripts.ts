#!/usr/bin/env node --experimental-specifier-resolution=node
import init from "../scripts/init.js"
import build from "../scripts/build.js";
import dev from "../scripts/dev.js";
import preview from "../scripts/preview.js";

const [, , ...args] = process.argv;

const [command] = args;

if (!args.some(arg => ["dev", "build", "preview", "init"].includes(arg))) {
    process.stdout.write("Command not found\n");
    process.exit(1);
}

switch (command) {
    case "build":
        build();
        break;
    case "dev":
        dev();
        break;
    case "preview":
        preview();
        break;
    case "init": {
        let folderToCreate = null;

        if (args.length == 2) {
            folderToCreate = args[1];
        }
        init(folderToCreate);
        break;
    }
}