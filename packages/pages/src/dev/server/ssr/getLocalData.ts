import path from "path";
import fs from "fs";
import { readdir } from "fs/promises";
import { findTemplateModuleInternal } from "./findTemplateModuleInternal.js";
import { ViteDevServer } from "vite";
import { validateGetPathValue } from "../../../common/src/template/internal/validateGetPathValue.js";
import { logWarning } from "../../../util/logError.js";

const LOCAL_DATA_PATH = "localData";

/**
 * LocalDataManifest contains data parsed out from the filesystem that is then used
 * to generate in the indexPage.
 */
export interface LocalDataManifest {
  static: Map<
    string,
    {
      // The featureName for a specific static template
      featureName: string;
      // A map from static page slug to a single locale
      slugToLocaleMap: Map<string, string>;
    }
  >;
  entity: Map<
    string,
    {
      uid: string;
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
    static: new Map(),
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

    const uid = data.uid?.toString();
    const entityId = data.id?.toString();
    const slug = data.slug?.toString();
    if (entityId) {
      localDataManifest.entity.set(featureName, [
        ...(localDataManifest.entity.get(featureName) || []),
        { uid, entityId, slug },
      ]);
    } else {
      // The lack of an entityId signifies that this is a static template.
      const templateModuleInternal = await findTemplateModuleInternal(
        vite,
        async (t) => featureName === t.config.name,
        templateFilepaths
      );
      if (!templateModuleInternal) {
        logWarning(
          `Could not find a static template for feature "${featureName}", skipping.`
        );
        continue;
      }

      const staticPath = templateModuleInternal.getPath({ document: data });
      const currentManifestData = localDataManifest.static.get(featureName);
      if (currentManifestData) {
        const occupiedSlugs = currentManifestData.slugToLocaleMap;
        if (occupiedSlugs.has(staticPath)) {
          throw new Error(
            `Slug "${staticPath}" is used by multiple static pages.  Check that ` +
              `the getPath() function in the template "${templateModuleInternal.templateName}" ` +
              "returns a unique slug for each locale."
          );
        }
        occupiedSlugs.set(staticPath, data.meta.locale);
      } else {
        try {
          validateGetPathValue(staticPath, templateModuleInternal.path);
        } catch (e) {
          logWarning(`${(e as Error).message}, skipping."`);
          continue;
        }
        const slugToLocaleMap = new Map();
        slugToLocaleMap.set(staticPath, data.meta.locale);
        localDataManifest.static.set(featureName, {
          featureName,
          slugToLocaleMap,
        });
      }
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
      throw "No localData exists. Please run `yext pages generate-test-data`";
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
    const isStatic = entityId === "";
    const isMatchingEntity = !isStatic && entityId === data.id;
    const matchesNameAndLocale =
      data.locale === locale && data.__.name === featureName;

    return (isStatic || isMatchingEntity) && matchesNameAndLocale;
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
      throw "No localData exists. Please run `yext pages generate-test-data`";
    } else {
      throw err;
    }
  }
};
