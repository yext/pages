import fs from "fs";
import path from "path";
import { Project, Node, SyntaxKind } from "ts-morph";
import { glob } from "glob";
import chalk from "chalk";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { convertToPosixPath } from "../../../common/src/template/paths.js";

/** Metadata for a serverless function. */
type FunctionMetadata = {
  /** Name of the function. */
  entrypoint: string;
};

/** ts-morph project for parsing function metadata */
const project = new Project();

/**
 * Returns a mapping of file path (relative to the repo root) to the metadata
 * for the function that is the default export of that file. If there is no default
 * export in the file, it will be left out of the mapping and an error will be logged
 * in the console.
 */
const getFunctionMetadataMap = async (
  projectStructure: ProjectStructure
): Promise<Record<string, FunctionMetadata>> => {
  const filepaths = glob
    .sync(
      convertToPosixPath(
        path.join(projectStructure.config.rootFolders.functions, "**/*.{js,ts}")
      ),
      { nodir: true }
    )
    .map((f) => path.resolve(f));

  const results = await Promise.allSettled(
    filepaths.map(generateFunctionMetadata)
  );
  const functionMetadataArray: [string, FunctionMetadata][] = results
    .filter((result) => {
      if (result.status === "fulfilled") {
        return true;
      } else {
        console.error(chalk.red(result.reason));
        return false;
      }
    })
    .map((result) => {
      return (result as PromiseFulfilledResult<[string, FunctionMetadata]>)
        .value;
    });

  return Object.fromEntries(functionMetadataArray);
};

/**
 * Generates a tuple containing the relative path of the file and its {@link FunctionMetadata}.
 * If the file does not contain a default export, a rejected {@link Promise} will be returned.
 */
async function generateFunctionMetadata(
  filepath: string
): Promise<[string, FunctionMetadata]> {
  project.addSourceFileAtPath(filepath);
  const defaultExportDeclaration = project
    .getSourceFile(filepath)
    ?.getDefaultExportSymbol()
    ?.getDeclarations()[0];
  const relativePath = path.relative(process.cwd(), filepath);
  if (Node.isExportAssignment(defaultExportDeclaration)) {
    const exportIdenfitier = defaultExportDeclaration.getChildrenOfKind(
      SyntaxKind.Identifier
    )[0];
    if (!exportIdenfitier) {
      throw new Error(
        `${relativePath} contains a default export assignment that is ` +
          "improperly formatted. It may have an anonymous function as the default export " +
          "which is not supported."
      );
    }
    return [relativePath, { entrypoint: exportIdenfitier.getText() }];
  } else if (Node.isFunctionDeclaration(defaultExportDeclaration)) {
    const entrypoint = defaultExportDeclaration.getName();
    if (!entrypoint) {
      throw new Error(
        `${relativePath} contains a default export function ` +
          "whose name cannot be parsed."
      );
    }
    return [relativePath, { entrypoint }];
  }
  throw new Error(
    `${relativePath} does not contain a properly formatted default export. ` +
      "The default export must be named and declared either in the function declaration " +
      "or in an `export default ...;` expresion."
  );
}

/** Generates a functionMetadata.json file from the functions directory. */
export const generateFunctionMetadataFile = async (
  projectStructure: ProjectStructure
) => {
  const functionMetadataMap = await getFunctionMetadataMap(projectStructure);
  const { rootFolders, distConfigFiles } = projectStructure.config;

  fs.writeFileSync(
    path.join(rootFolders.functions, distConfigFiles.functionMetadata),
    JSON.stringify(functionMetadataMap, null, 2)
  );
};

/** Returns whether or not a functionMetadata.json file should be generated. */
export const shouldGenerateFunctionMetadata = (
  projectStructure: ProjectStructure
) => {
  return fs.existsSync(projectStructure.config.rootFolders.functions);
};
