#!/usr/bin/env node --experimental-specifier-resolution=node
import init from "../init/init.js";
import dev from "../dev/dev.js";
import preview from "../preview/preview.js";

const [, , ...args] = process.argv;

// sites-scripts requires react and react-dom be installed to function appropriately. If
// these are not installed in instruct the user to install them.
["react", "react-dom"].forEach((dep) => {
  try {
    import(dep);
  } catch (e) {
    console.error(
      `Cannot find "${dep}" which is a necessary dependency for generation. Please install this module.`
    );
    process.exit(1);
  }
});

const [command] = args;

if (!args.some((arg) => ["dev", "preview", "init"].includes(arg))) {
  process.stdout.write("Command not found\n");
  process.exit(1);
}

switch (command) {
  case "dev":
    dev();
    break;
  case "preview":
    preview();
    break;
  case "init": {
    let folderToCreate;

    if (args.length == 2) {
      folderToCreate = args[1];
    }
    init(folderToCreate || null);
    break;
  }
}
