import path from "path";
import fs from "fs";
import { readdir } from "fs/promises";
import { findTemplateModuleInternal } from "./findTemplateModuleInternal.js";
import { ViteDevServer } from "vite";

const LOCAL_DATA_PATH = "localData";

/**
 * LocalDataManifest contains data parsed out from the filesystem that is then used
 * to generate in the indexPage.
 */
export interface LocalDataManifest {
  static: {
    // The featureName for a specific static template
    featureName: string;
    // The return value of the template's getPath()
    staticURL: string;
  }[];
  entity: Map<
    string,
    {
      // The entity's document.id
      entityId: string;
      // The entity's document.slug
      slug: string | undefined;
    }[]
  >;
}

// getLocalDataManifest will read through the files in the /localData folder and
// create a LocalDataManifest from it. This will allow us to generate hyperlinks
// to each page on the dev server's index page.
export const getLocalDataManifest = async (
  vite: ViteDevServer,
  templateFilepaths: string[]
): Promise<LocalDataManifest> => {
  const localDataManifest: LocalDataManifest = {
    static: [],
    entity: new Map(),
  };

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
    // Check for a feature name because the localData folder will have a mapping.json
    // file which should not be included in the manifest.
    if (!featureName) {
      continue;
    }
    const entityId = data.id?.toString();
    const slug = data.slug?.toString();
    if (entityId) {
      localDataManifest.entity.set(featureName, [
        ...(localDataManifest.entity.get(featureName) || []),
        { entityId, slug },
      ]);
    } else {
      // The lack of an entityId signifies that this is a static template.
      const templateModuleInternal = await findTemplateModuleInternal(
        vite,
        (t) => featureName === t.config.name,
        templateFilepaths
      );
      if (!templateModuleInternal) {
        console.error(
          `Could not find a static template for feature "${featureName}", skipping.`
        );
        continue;
      }
      localDataManifest.static.push({
        featureName,
        staticURL: templateModuleInternal.getPath({}),
      });
    }
  }

  return localDataManifest;
};

const getLocalData = async (
  criterion: (data: any) => boolean
): Promise<Record<string, any> | undefined> => {
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
      if (criterion(data)) {
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
};

export const getLocalDataForEntityOrStaticPage = async ({
  locale,
  featureName,
  entityId,
}: {
  locale: string;
  featureName: string;
  entityId: string;
}) => {
  const localData = await getLocalData((data) => {
    if (entityId !== "" && data.id !== entityId) {
      return false;
    }
    return data.locale === locale && data.__.name === featureName;
  });
  if (!localData) {
    throw new Error(
      `No localData files match entityId, featureName, and locale: ${entityId}, ${featureName}, ${locale}`
    );
  }
  return localData;
};

export const getLocalDataForSlug = async ({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) => {
  const localDataForSlug: Record<string, any>[] = (
    await getAllLocalData()
  ).filter((d) => d.slug === slug);
  console.log("loc dat slug", localDataForSlug);
  if (localDataForSlug.length === 0) {
    throw new Error(
      `No localData files match slug and locale: ${slug} ${locale}`
    );
  } else if (localDataForSlug.length > 1) {
    throw new Error(
      `Multiple localData files match slug and locale: ${slug} ${locale}, expected only a single file`
    );
  }
  return localDataForSlug[0];
};

const getAllLocalData = async (): Promise<Record<string, any>[]> => {
  try {
    const dir = await readdir(LOCAL_DATA_PATH);
    return dir.map((fileName) => {
      const data = JSON.parse(
        fs
          .readFileSync(
            path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)
          )
          .toString()
      );
      return data;
    });
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw "No localData exists. Please run `yext sites generate-test-data`";
    } else {
      throw err;
    }
  }
};
