import { initCommandModule } from "../init/init.js";
import { devCommandModule } from "../dev/dev.js";
import { generateCommandModule } from "../generate/generate.js";
import { buildCommandModule } from "../build/build.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import process from "process";
console.log("start pages.js", process.argv);

// // pages requires react and react-dom be installed to function appropriately. If
// // these are not installed in instruct the user to install them.
// ["react", "react-dom"].forEach((dep) => {
//   try {
//     import(dep);
//   } catch (e) {
//     console.error(
//       `Cannot find "${dep}" which is a necessary dependency for generation. Please install this module.`
//     );
//     process.exit(1);
//   }
// });

yargs(hideBin(process.argv))
  .scriptName("pages")
  .command(devCommandModule)
  .command(initCommandModule)
  .command(generateCommandModule)
  .command(buildCommandModule)
  .demandCommand()
  .version(false)
  .strict()
  .help()
  .parse();
