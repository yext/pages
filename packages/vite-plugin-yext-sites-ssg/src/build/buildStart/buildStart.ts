import * as path from "path";
import glob from "glob";
import logger from "../../log.js";
import fs from "fs";
import { PluginContext, NormalizedInputOptions, EmitFile } from "rollup";
import { generateHydrationEntryPoints } from "./hydration.js";
import { ProjectStructure } from "../../../../common/src/project/structure.js";

const REACT_EXTENSIONS = new Set([".tsx", ".jsx"]);

export default (projectStructure: ProjectStructure) => {
  return async function (
    this: PluginContext,
    options: NormalizedInputOptions
  ): Promise<void> {
    console.log(yextBanner);
    clean(projectStructure.distRoot.getAbsolutePath());

    const templates: string[] = glob.sync(
      `${projectStructure.templatesRoot.getAbsolutePath()}/**/*.{tsx,jsx,js,ts}`
    );

    const reactTemplates = templates.filter((templatePath) =>
      REACT_EXTENSIONS.has(path.parse(templatePath).ext)
    );

    copyPluginFiles(this.emitFile);

    let finisher = logger.timedLog({
      startLog: "Generating entry-points for hydration",
    });
    await generateHydrationEntryPoints(
      reactTemplates,
      projectStructure.hydrationBundleOutputRoot.getAbsolutePath()
    );
    finisher.succeed(
      `Generated ${reactTemplates.length} hydration entry-point${
        reactTemplates.length > 1 ? "s" : ""
      }`
    );

    await injectRenderer(this.emitFile);
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

const copyPluginFiles = (fileEmitter: EmitFile) => {
  let finisher = logger.timedLog({
    startLog: "Copying Yext plugin files",
  });

  const currentPath = new URL(import.meta.url).pathname;
  const pathToPluginsDir = path.resolve(currentPath, "../../../../../../plugin");
  const pluginFiles = glob.sync(`${pathToPluginsDir}/*.ts`);

  if (pluginFiles.length == 0) {
    finisher.fail("Failed to copy Yext plugin files");
  }

  pluginFiles.forEach((filepath) => {
    fileEmitter({
      type: "asset",
      fileName: `plugin/${path.basename(filepath)}`,
      source: fs.readFileSync(filepath).toString(),
    });
  });

  finisher.succeed("Successfully copied Yext plugin files");
};

// Injects the renderer module which is needed for all sites built with yss as an entrypoint chunk.
const injectRenderer = async (fileEmitter: EmitFile) => {
  let finisher = logger.timedLog({
    startLog: "Injecting template renderer.",
  });

  const currentDir = new URL(".", import.meta.url).pathname;
  fileEmitter({
    type: "chunk",
    id: `${currentDir}/rendering/renderer.js`,
    fileName: "assets/renderer/templateRenderer.js",
  });

  finisher.succeed("Injected template renderer.");
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
