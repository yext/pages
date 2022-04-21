#!/usr/bin/env node --experimental-specifier-resolution=node
import init from "../init/init.js"
import build from "../build/build.js";
import dev from "../dev/dev.js";
import preview from "../preview/preview.js";

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