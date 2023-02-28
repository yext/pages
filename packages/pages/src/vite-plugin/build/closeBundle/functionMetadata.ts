import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import glob from "glob";

const FUNCTIONS_PATH = path.resolve("functions");
const FUNCTION_METADATA_PATH = path.join(
  FUNCTIONS_PATH,
  "functionMetadata.json"
);
const TEMP_DIR = ".temp";

/** Metadata for a serverless function. */
type FunctionMetadata = {
  /** Name of the function. */
  entrypoint: string;
};

/**
 * Returns a mapping of file path (relative to the repo root) to the metadata
 * for the function that is the default export of that file.
 */
const getFunctionMetadataMap = async (): Promise<
  Record<string, FunctionMetadata>
> => {
  const filepaths = glob
    .sync(path.join(FUNCTIONS_PATH, "**/*.{tsx,jsx,js,ts}"), { nodir: true })
    .map((f) => path.resolve(f));
  const functionMetadataArray: [string, FunctionMetadata][] = await Promise.all(
    filepaths.map(async (filepath) => {
      const buildResult = await esbuild.build({
        entryPoints: [filepath],
        outdir: TEMP_DIR,
        write: false,
        format: "esm",
        bundle: true,
      });
      const importedFile = await importFromString(
        buildResult.outputFiles[0].text
      );
      const relativePath = path.relative(process.cwd(), filepath);
      return [relativePath, { entrypoint: importedFile.default?.name }];
    })
  );
  return Object.fromEntries(
    functionMetadataArray.filter(([, metadata]) => metadata.entrypoint)
  );
};

/** Generates a functionMetadata.json file from the functions directory. */
export const generateFunctionMetadataFile = async () => {
  const functionMetadataMap = await getFunctionMetadataMap();
  fs.writeFileSync(
    FUNCTION_METADATA_PATH,
    JSON.stringify(functionMetadataMap, null, "  ")
  );
};

/** Returns whether or not a functionMetadata.json file should be generated. */
export const shouldGenerateFunctionMetadata = () => {
  return fs.existsSync(FUNCTIONS_PATH);
};
