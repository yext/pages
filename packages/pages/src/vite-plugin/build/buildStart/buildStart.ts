import path, { parse } from "node:path";
import { glob } from "glob";
import logger from "../../log.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { PluginContext, EmitFile } from "rollup";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { Path } from "../../../common/src/project/path.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";
import { getGlobalClientServerRenderTemplates } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { readdir } from "fs/promises";
import { NormalizedInputOptions } from "rollup";

export default (projectStructure: ProjectStructure) => {
  return async function (
    this: PluginContext,
    inputOptions: NormalizedInputOptions
  ): Promise<void> {
    inputOptions.input = await discoverInputs(
      projectStructure.getTemplatePaths(),
      projectStructure
    );
    console.log(yextBanner);
    clean(new Path(projectStructure.config.rootFolders.dist).getAbsolutePath());
    copyPluginFiles(this.emitFile);

    await injectRenderer(this.emitFile, projectStructure);
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
    .sync(convertToPosixPath(`${pathToPluginsDir}/*.ts`))
    .map((f) => path.resolve(f));

  if (pluginFiles.length == 0) {
    finisher.fail("Failed to copy Yext plugin files");
    return;
  }

  pluginFiles.forEach((filepath) => {
    const filename = path.posix.join("plugin", path.basename(filepath));
    fileEmitter({
      type: "asset",
      fileName: filename,
      source: fs.readFileSync(filepath).toString(),
    });
  });

  finisher.succeed("Successfully copied Yext plugin files");
};

// Injects the renderer module which is needed for all sites built with yss as an entrypoint chunk.
const injectRenderer = async (
  fileEmitter: EmitFile,
  projectStructure: ProjectStructure
) => {
  const finisher = logger.timedLog({
    startLog: "Injecting template renderer.",
  });

  const currentDir = fileURLToPath(new URL(".", import.meta.url));
  fileEmitter({
    type: "chunk",
    id: path.join(currentDir, "rendering", "renderer.js"),
    fileName: `${projectStructure.config.subfolders.assets}/${projectStructure.config.subfolders.renderer}/templateRenderer.js`,
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

/**
 * Produces a {@link InputOption} by adding all templates at {@link rootTemplateDir} and
 * {@link scopedTemplateDir} to be output at {@code server/}. If there are two files
 * that share the same name between the two provided template folders, only the file
 * in scoped template folder path is included. Also adds an additional entry-point
 * for all templates ending in tsx to be used to hydrate the bundle.
 *
 * @param rootTemplateDir the directory where all templates are stored.
 * @param scopedTemplateDir the directory where a subset of templates use for the build are stored.
 * @param projectStructure
 * @returns
 */
const discoverInputs = async (
  templatePaths: Path[],
  projectStructure: ProjectStructure
): Promise<{ [entryAlias: string]: string }> => {
  const entryPoints: Record<string, string> = {};
  const updateEntryPoints = async (dir: string) =>
    (await readdir(dir, { withFileTypes: true }))
      .filter((dirent) => !dirent.isDirectory())
      .map((file) => file.name)
      .filter(
        (f) =>
          f !== "_client17.tsx" && f !== "_client.tsx" && f !== "_server.tsx"
      )
      .forEach((template) => {
        const parsedPath = parse(template);
        const bundlePath = template.includes(".client")
          ? projectStructure.config.subfolders.clientBundle
          : projectStructure.config.subfolders.serverBundle;
        const outputPath = `${bundlePath}/${parsedPath.name.replace(
          ".client",
          ""
        )}`;
        if (entryPoints[outputPath]) {
          return;
        }
        entryPoints[outputPath] = path.join(dir, template);
      });

  for (const templatePath of templatePaths) {
    await updateEntryPoints(templatePath.getAbsolutePath());
  }

  return { ...entryPoints, ...discoverRenderTemplates(projectStructure) };
};

/**x
 * Produces the entry points for the client and server render templates to be output at
 * {@code render/}.
 *
 * @param projectStructure
 */
const discoverRenderTemplates = (
  projectStructure: ProjectStructure
): Record<string, string> => {
  const entryPoints: Record<string, string> = {};

  // Move the [compiled] _server.ts and _client.ts render template to /assets/render
  const clientServerRenderTemplates = getGlobalClientServerRenderTemplates(
    projectStructure.getTemplatePaths()
  );

  const { renderBundle } = projectStructure.config.subfolders;

  // server
  entryPoints[`${renderBundle}/_server`] =
    clientServerRenderTemplates.serverRenderTemplatePath;

  // client
  entryPoints[`${renderBundle}/_client`] =
    clientServerRenderTemplates.clientRenderTemplatePath;

  return entryPoints;
};
