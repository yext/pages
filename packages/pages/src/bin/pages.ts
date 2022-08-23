#!/usr/bin/env node --experimental-specifier-resolution=node
import init from "../init/init.js";
import dev from "../dev/dev.js";
import preview from "../preview/preview.js";
import { features } from "../generate/features.js";

const [, , ...args] = process.argv;

// pages requires react and react-dom be installed to function appropriately. If
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

switch (command) {
  case "dev":
    await dev();
    break;
  case "preview":
    preview();
    break;
  case "init": {
    let folderToCreate;

    if (args.length == 2) {
      folderToCreate = args[1];
    }
    await init(folderToCreate || null);
    break;
  }
  case "generate": {
    const generateTargets = ["features"];

    if (args.length != 2) {
      process.stdout.write(
        `Missing a target to generate. Valid values are: ${generateTargets.join(
          ", "
        )}\n`
      );
      process.exit(1);
    }

    const target = args[1];

    switch (target) {
      case "features": {
        await features();
        break;
      }
      default: {
        process.stdout.write(
          `Target for 'generate' command is invalid: ${target}. Valid values are: ${generateTargets.join(
            ", "
          )}\n`
        );
        process.exit(1);
      }
    }
    break;
  }
  default: {
    process.stdout.write(`Command not found: ${command}\n`);
    process.exit(1);
  }
}
