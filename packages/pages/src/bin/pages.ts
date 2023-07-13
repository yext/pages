import { Command } from "commander";
import { buildCommand } from "../build/build.js";
import { devCommand } from "../dev/dev.js";
import { prodCommand } from "../prod/prod.js";
import { generateCommand } from "../generate/generate.js";

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

const program = new Command();
program.name("pages").description("Yext PagesJS CLI");
buildCommand(program);
devCommand(program);
prodCommand(program);
generateCommand(program);

await program.parseAsync(process.argv);
