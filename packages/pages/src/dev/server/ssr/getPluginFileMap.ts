import path from "path";
import fs from "fs";

const PLUGIN_FILE_MAP_PATH = path.resolve(
  ".artifact-output/pluginFileMap.json"
);

/** The type of event for the serverless function. */
export enum EventType {
  /** The function is in an error state. */
  UNKNOWN_EVENT = 0,
  /** A function that is invoked on a URL change event. */
  ON_URL_CHANGE = 1,
  /** A function that is invoked on a page generate event. */
  ON_PAGE_GENERATE = 2,
  /** An API (or HTTP) function. */
  API = 3,
}

/** Source data associated with a serverless function. */
export type PluginSource = {
  /** File names of the source files for the function. */
  sourceFileNames: string[];
  /** Name of the function. */
  functionName: string;
  /** {@inheritDoc EventType} */
  event: EventType;
  /** The endpoint path if it is an API function. */
  serverlessFunctionPath?: string;
};

/** Returns the pluginFileMap as a mapping of function name to source data. */
export const getPluginFileMap = (): Record<string, PluginSource> => {
  JSON.parse(fs.readFileSync(PLUGIN_FILE_MAP_PATH).toString());
  try {
    return JSON.parse(fs.readFileSync(PLUGIN_FILE_MAP_PATH).toString());
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // If there is no pluginFileMap, then just return an empty object.
      return {};
    } else {
      throw err;
    }
  }
};
