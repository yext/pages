import path from "path";
import fs from "fs";
import { readdir } from "fs/promises";

const LOCAL_DATA_PATH = "localData";

class LocalDataManifest {
  static: Array<string>;
  entity: Map<string, Array<string>>;

  constructor() {
    this.static = [];
    this.entity = new Map<string, Array<string>>();
  }
}

// getLocalDataManifest will read through the files in the /localData folder and
// create a LocalDataManifest from it. This will allow us to generate hyperlinks
// to each page on the dev server's index page.
export const getLocalDataManifest = async (): Promise<LocalDataManifest> => {
  let localDataManifest = new LocalDataManifest();

  let dir;
  try {
    dir = await readdir(LOCAL_DATA_PATH);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // If there is no localData folder, then just return an empty manifest.
      return localDataManifest;
    } else {
      throw err;
    }
  }

  for (const fileName of dir) {
    const data = JSON.parse(
      fs
        .readFileSync(
          path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)
        )
        .toString()
    );

    const featureName = data.__?.name?.toString();
    const entityId = data.id?.toString();

    // Check for a feature name because the localData folder will have a mapping.json
    // file which should not be included in the manifest.
    if (featureName) {
      if (entityId) {
        localDataManifest.entity.set(featureName, [
          ...(localDataManifest.entity.get(featureName) || []),
          entityId,
        ]);
      } else {
        // The lack of an entityId signifies that this is a static template.
        localDataManifest.static.push(featureName);
      }
    }
  }

  return localDataManifest;
};

export const getLocalDataForEntity = async (entityId: string) => {
  try {
    const dir = await readdir(LOCAL_DATA_PATH);

    for (const fileName of dir) {
      const data = JSON.parse(
        fs
          .readFileSync(
            path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)
          )
          .toString()
      );

      if (data.id?.toString() === entityId) {
        return data;
      }
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw "No localData exists. Please run `yext sites generate-test-data`";
    } else {
      throw err;
    }
  }

  throw `No localData files match entityId ${entityId}`;
};
