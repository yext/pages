import { ProjectStructure } from "../../../common/src/project/structure.js";
import { glob } from "glob";
import path from "path";
import esbuild from "esbuild";
import { COMMON_ESBUILD_LOADERS } from "../../../common/src/loader/esbuild.js";
import { processEnvVariables } from "../../../util/processEnvVariables.js";
import { FunctionMetadataParser } from "../../../common/src/function/internal/functionMetadataParser.js";

/**
 * Returns a mapping of file path (relative to the repo root) to the metadata
 * for the function that is the default export of that file. If there is no default
 * export in the file, it will be left out of the mapping and an error will be logged
 * in the console.
 */
export const bundleServerlessFunctions = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  const { rootFolders, subfolders } = projectStructure.config;

  const filepaths = glob
    .sync(
      path.join(
        rootFolders.source,
        subfolders.serverlessFunctions,
        "**/*.{js,ts}"
      ),
      { nodir: true }
    )
    .map((f) => path.resolve(f));

  await Promise.allSettled(
    filepaths.map((f) => bundleServerlessFunction(f, projectStructure))
  );
};

/**
 * Generates a tuple containing the relative path of the file and its {@link FunctionMetadata}.
 * If the file does not contain a default export, a rejected {@link Promise} will be returned.
 */
const bundleServerlessFunction = async (
  filepath: string,
  projectStructure: ProjectStructure
): Promise<void> => {
  const fmp = new FunctionMetadataParser(filepath, projectStructure);
  const { rootFolders, subfolders } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.serverlessFunctions);
  const { name } = fmp.functionMetadata;

  await esbuild.build({
    entryPoints: [filepath],
    entryNames: `${name}/mod`,
    outExtension: { ".js": ".ts" },
    outdir: outdir,
    write: true,
    format: "esm",
    bundle: true,
    loader: COMMON_ESBUILD_LOADERS,
    define: processEnvVariables("YEXT_PUBLIC"),
  });
};
