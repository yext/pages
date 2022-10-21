import * as path from "path";
import glob from "glob";
import logger from "../../log.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { PluginContext, EmitFile } from "rollup";
import { generateHydrationEntryPoints } from "./hydration.js";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepaths } from "../../../common/src/template/internal/getTemplateFilepaths.js";

const REACT_EXTENSIONS = new Set([".tsx", ".jsx"]);

export default (projectStructure: ProjectStructure) => {
  return async function (this: PluginContext): Promise<void> {
    console.log(yextBanner);
    clean(projectStructure.distRoot.getAbsolutePath());

    const templates = getTemplateFilepaths(
      projectStructure.scopedTemplatesPath
        ? [projectStructure.scopedTemplatesPath, projectStructure.templatesRoot]
        : [projectStructure.templatesRoot]
    );
    const reactTemplates = templates.filter((templatePath) =>
      REACT_EXTENSIONS.has(path.parse(templatePath).ext)
    );

    copyPluginFiles(this.emitFile);

    const finisher = logger.timedLog({
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
  const finisher = logger.timedLog({
    startLog: "Copying Yext plugin files",
  });

  const currentPath = fileURLToPath(import.meta.url);
  const pathToPluginsDir = path.resolve(
    currentPath,
    path.join("..", "..", "..", "..", "plugin")
  );
  // We must use path.resolve to reconcile filepaths on Windows as glob returns filepaths with forward slashes by default.
  const pluginFiles = glob
    .sync(`${pathToPluginsDir}/*.ts`)
    .map((f) => path.resolve(f));

  if (pluginFiles.length == 0) {
    finisher.fail("Failed to copy Yext plugin files");
    return;
  }

  pluginFiles.forEach((filepath) => {
    const filename = path.join("plugin", path.basename(filepath));
    fileEmitter({
      type: "asset",
      fileName: filename,
      source: fs.readFileSync(filepath).toString(),
    });
  });

  finisher.succeed("Successfully copied Yext plugin files");
};

// Injects the renderer module which is needed for all sites built with yss as an entrypoint chunk.
const injectRenderer = async (fileEmitter: EmitFile) => {
  const finisher = logger.timedLog({
    startLog: "Injecting template renderer.",
  });

  const currentDir = fileURLToPath(new URL(".", import.meta.url));
  fileEmitter({
    type: "chunk",
    id: path.join(currentDir, "rendering", "renderer.js"),
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
