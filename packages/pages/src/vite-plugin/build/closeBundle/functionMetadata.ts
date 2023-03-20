import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { importFromString } from "module-from-string";
import glob from "glob";
import chalk from "chalk";

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
 * for the function that is the default export of that file. If there is no default
 * export in the file, it will be left out of the mapping and an error will be logged
 * in the console.
 */
const getFunctionMetadataMap = async (): Promise<
  Record<string, FunctionMetadata>
> => {
  const filepaths = glob
    .sync(path.join(FUNCTIONS_PATH, "**/*.{js,ts}"), { nodir: true })
    .map((f) => path.resolve(f));
  const functionMetadataArray: [string, FunctionMetadata][] = [];

  await Promise.allSettled(filepaths.map(generateFunctionMetadata)).then(
    (results) =>
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          functionMetadataArray.push(result.value);
        } else {
          console.error(chalk.red(result.reason));
        }
      })
  );

  return Object.fromEntries(functionMetadataArray);
};

/**
 * Generates a tuple containing the relative path of the file and its {@link FunctionMetadata}.
 * If the file does not contain a default export, a rejected {@link Promise} will be returned.
 */
async function generateFunctionMetadata(
  filepath: string
): Promise<[string, FunctionMetadata]> {
  const buildResult = await esbuild.build({
    entryPoints: [filepath],
    outdir: TEMP_DIR,
    write: false,
    format: "esm",
    bundle: true,
  });
  const importedFile = await importFromString(buildResult.outputFiles[0].text);
  const relativePath = path.relative(process.cwd(), filepath);

  if (!importedFile.default) {
    throw new Error(`${relativePath} does not contain a default export.`);
  }

  return [relativePath, { entrypoint: importedFile.default.name }];
}

/** Generates a functionMetadata.json file from the functions directory. */
export const generateFunctionMetadataFile = async () => {
  const functionMetadataMap = await getFunctionMetadataMap();
  fs.writeFileSync(
    FUNCTION_METADATA_PATH,
    JSON.stringify(functionMetadataMap, null, 2)
  );
};

/** Returns whether or not a functionMetadata.json file should be generated. */
export const shouldGenerateFunctionMetadata = () => {
  return fs.existsSync(FUNCTIONS_PATH);
};
