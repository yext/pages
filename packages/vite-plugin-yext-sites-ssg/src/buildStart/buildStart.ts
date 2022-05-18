import { Paths } from "../paths.js";
import * as path from "path";
import glob from "glob";
import logger from "../log.js";
import fs from "fs";
import { PluginContext, NormalizedInputOptions, EmittedFile } from "rollup";
import { generateHydrationEntryPoints } from "./hydration.js";

const REACT_EXTENSIONS = new Set([".tsx", ".jsx"]);

export default (paths: Paths) => {
  return async function (
    this: PluginContext,
    options: NormalizedInputOptions
  ): Promise<void> {
    console.log(yextBanner);
    clean(paths.distDir);

    const templates: string[] = glob.sync(
      `${paths.templateDir}/**/*.{tsx,jsx,js,ts}`
    );

    const reactTemplates = templates.filter((templatePath) =>
      REACT_EXTENSIONS.has(path.parse(templatePath).ext)
    );

    let finisher1 = logger.timedLog({
      startLog: "Copying Yext plugin files",
    });
    copyPluginFiles(this.emitFile);
    finisher1.succeed("Successfully copied Yext plugin files");

    let finisher2 = logger.timedLog({
      startLog: "Generating entry-points for hydration",
    });
    await generateHydrationEntryPoints(
      reactTemplates,
      paths.hydrationOutputDir
    );
    finisher2.succeed(
      `Generated ${reactTemplates.length} hydration entry-point${
        reactTemplates.length > 1 ? "s" : ""
      }`
    );
  };
};

const clean = (yextDir: string) => {
  const finisher = logger.timedLog({
    startLog: "Cleaning build artifacts",
  });
  try {
    fs.rmSync(yextDir, { recursive: true });
    finisher.succeed("Finished cleaning");
  } catch (e) {
    finisher.fail("Nothing to clean");
  }
};

const currentPath = new URL(import.meta.url).pathname;

const copyPluginFiles = (fileEmitter: (emittedFile: EmittedFile) => string) => {
  const pathToPluginsDir = path.resolve(currentPath, "../../../plugin");
  const pluginFiles = glob.sync(`${pathToPluginsDir}/*.ts`);

  pluginFiles.forEach((filepath) => {
    fileEmitter({
      type: "asset",
      fileName: `plugin/${path.basename(filepath)}`,
      source: fs.readFileSync(filepath).toString(),
    });
  });
};

const yextBanner = `
                  :=*#%@@@@@%#+-:
             :=#@@%*+==-----=+*#%@%*-.
          :*@%*-.                 :=*@%+.
       .=%@+:                         -#@#=
      +@@=                              .+@%-
    -@%-                                   +@#
   =@#.       :-       =:    :=+==:         :%@:
  =@*         +@#-   :%@=  =@%+==*@@:        .@%.
  @@.          :@@* +@%   :@%   *@@=          :@%
 #@-             =@@@+    +@- =%@*.:+:         *@-
=@#               =@+     .@@%@=  :@%.         -@*
%@+               -@+      .*@@#%@%+.           @%
@@=                                             @@
@@+           #@+.    +@+ :%%%%@@%%%%=          @@
+@*            -%@*:+@#:       %@.             :@#
 @@.             :@@@=         %@.             +@=
 -@#            *@@=%@+        %@.             @@.
  *@-         =%@*.  +@%-      %@.            #@-
   %@-        -=       +:      ==            *@=
    *@*                                    :%@-
     -%@+.                               :*@#.
       =#@*:                           -#@#:
         :*@%+:                     -*@%=
            -+%@#*=-:.       .:-+*%@#=.
                :-+*#%@@@@@@@%#*=-.

      Built with the Yext SSG Plugin
`;
