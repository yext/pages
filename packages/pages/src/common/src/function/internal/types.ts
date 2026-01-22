import path from "path";
import { FunctionModule, FunctionType } from "../types.js";
import { validateFunctionModule } from "./validateFunctionModule.js";
import { PluginEvent } from "../../ci/ci.js";
import { ProjectStructure } from "../../project/structure.js";
import { FunctionMetadataParser } from "./functionMetadataParser.js";

/**
 * A domain representation of a serverless function module. Contains all fields from an imported
 * module as well as metadata about the module used in downstream processing.
 */
export interface FunctionModuleInternal {
  /** The filepath to the serverless function file. */
  filePath: path.ParsedPath;
  /** The exported config function. */
  config: FunctionConfigInternal;
  /** The exported function. */
  default?: FunctionType;
  /** The slugs to host the function at. */
  slug: {
    /** The slug defined by the user. Example: api/user/[id]/profile */
    original: string;
    /** Used for the production build. Example: api/user/{{id}}/profile */
    production: string;
    /** Used for the dev server. Example: api/user/:id/profile */
    dev: string;
  };
}

/**
 * The exported `config` function's definition.
 */
export interface FunctionConfigInternal {
  /** The given name of the serverless function. */
  name: string;
  /** The http event. */
  event: PluginEvent;
  /** The default export's name. */
  functionName: string;
}

/**
 * Converts user-provided function information to an internal module.
 * @param functionFilepath the filepath information for the function
 * @param functionModule the public function module to convert
 */
export const convertFunctionModuleToFunctionModuleInternal = (
  functionFilepath: path.ParsedPath,
  functionModule: FunctionModule,
  projectStructure: ProjectStructure
): FunctionModuleInternal => {
  const fmp = new FunctionMetadataParser(path.format(functionFilepath), projectStructure);
  const { filepath, name, slug, functionType } = fmp.functionMetadata;

  if (functionType === "http" || functionType === "onUrlChange") {
    validateFunctionModule(functionFilepath.dir, functionModule);

    return {
      default: functionModule.default,
      config: {
        name: name,
        functionName: "default",
        event: convertToPluginEvent(functionType),
      },
      filePath: path.parse(filepath),
      slug: slug,
    };
  } else {
    throw new Error(
      `Cannot load ${path.format(
        functionFilepath
      )}.\nAll Serverless Functions should live in src/functions/http or src/functions/onUrlChange.`
    );
  }
};

export const convertToPluginEvent = (event: string): PluginEvent => {
  switch (event) {
    case "http":
      return "API";
    case "onUrlChange":
      return "ON_URL_CHANGE";
    default:
      throw new Error(`No matching PluginEvent found for: ${event}`);
  }
};
