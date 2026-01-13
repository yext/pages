import path from "path";
import fs from "fs";
import { readdir } from "fs/promises";
import { ViteDevServer } from "vite";
import { validateGetPathValue } from "../../../common/src/template/internal/validateGetPathValue.js";
import { logWarning } from "../../../util/logError.js";
import { loadTemplateModuleCollectionUsingVite } from "../../../common/src/template/loader/loader.js";

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
      // A map from static page path to a set of locales
      pathToLocalesMap: Map<string, string[]>;
    }
  >;
  entity: Map<
    string,
    {
      // The entity's document.uid (internal id)
      uid: string;
      // The entity's document.id (external id)
      entityId: string;
      // The entity's document.slug
      slug?: string;
      // The entity profile's locale
      locale: string;
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

  const templateModuleCollection = await loadTemplateModuleCollectionUsingVite(
    vite,
    templateFilepaths
  );

  const staticPaths: string[] = [];
  for (const fileName of dir) {
    const data = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)).toString()
    );

    const featureName = data.__?.name?.toString();
    // Check for a feature name because the localData folder will have a mapping.json
    // file which should not be included in the manifest.
    if (!featureName) {
      continue;
    }

    const templateModuleInternal = templateModuleCollection.get(featureName);

    const uid = data.uid?.toString();
    const entityId = data.id?.toString();
    const slugField = templateModuleInternal?.config?.slugField;
    const slug = slugField ? data[slugField] : data.slug?.toString();
    const locale = data.locale?.toString();
    if (entityId) {
      localDataManifest.entity.set(featureName, [
        ...(localDataManifest.entity.get(featureName) || []),
        { uid, entityId, slug, locale },
      ]);
    } else {
      // The lack of an entityId signifies that this is a static template.
      if (!templateModuleInternal) {
        logWarning(`Could not find a static template for feature "${featureName}", skipping.`);
        continue;
      }

      const staticPath = templateModuleInternal.getPath({ document: data });
      if (staticPaths.includes(staticPath)) {
        throw new Error(
          `Path "${staticPath}" is used by multiple static pages.  Check that ` +
            `the getPath() function in the template "${templateModuleInternal.templateName}" ` +
            "returns a unique path for each locale."
        );
      } else {
        try {
          staticPaths.push(staticPath);
          validateGetPathValue(staticPath, templateModuleInternal.path);
        } catch (e) {
          logWarning(`${(e as Error).message}, skipping."`);
          continue;
        }
        let pathToLocalesMap = localDataManifest.static.get(featureName)?.pathToLocalesMap;
        if (!pathToLocalesMap) {
          pathToLocalesMap = new Map();
          pathToLocalesMap.set(staticPath, [data.meta.locale]);
        } else {
          const existingLocales = pathToLocalesMap.get(staticPath) || [];
          existingLocales?.push(data.meta.locale);
          pathToLocalesMap.set(staticPath, existingLocales);
        }

        localDataManifest.static.set(featureName, {
          featureName,
          pathToLocalesMap,
        });
      }
    }
  }
  return localDataManifest;
};

export const readLocalDataFile = async (
  localDataFilepath: string
): Promise<Record<string, any> | undefined> => {
  try {
    return JSON.parse(
      fs
        .readFileSync(path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${localDataFilepath}`))
        .toString()
    );
  } catch (_) {
    return;
  }
};

export type LocalData = {
  localDataFilename: string;
  document: Record<string, any>;
};

/**
 * Reads through all localData and returns the first document that matches criterion.
 */
export const getLocalData = async (
  criterion: (data: any) => boolean
): Promise<LocalData | undefined> => {
  try {
    const dir = await readdir(LOCAL_DATA_PATH);

    for (const fileName of dir) {
      const data = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)).toString()
      );
      if (criterion(data)) {
        return {
          localDataFilename: fileName,
          document: data,
        };
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

/**
 * Reads through all localData and returns all documents that match criterion.
 */
export const getAllLocalData = async (criterion: (data: any) => boolean): Promise<LocalData[]> => {
  try {
    const dir = await readdir(LOCAL_DATA_PATH);
    return dir
      .map((fileName) => {
        const data = JSON.parse(
          fs.readFileSync(path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)).toString()
        );
        if (criterion(data)) {
          return {
            localDataFilename: fileName,
            document: data,
          };
        }
        return {
          localDataFilename: "",
          document: undefined,
        };
      })
      .filter((data) => data.document !== undefined);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw "No localData exists. Please run `yext pages generate-test-data`";
    } else {
      throw err;
    }
  }
};

/**
 * A filter for finding localData for static templates. Can be used for both dynamic and
 * non-dynamic mode since static template data always comes from localData.
 *
 * @param featureName - the static template name
 * @param locale  - optional locale, required for non-dynamic mode
 * @returns
 */
export const staticPageCriterion = (
  featureName: string,
  locale?: string
): ((data: any) => boolean) => {
  {
    return (data: any) => {
      if (!data.__) {
        return false;
      }
      return (
        "staticPage" in data.__ &&
        data.__.name === featureName &&
        (locale ? data.locale === locale : true)
      );
    };
  }
};

/**
 * A filter for finding localData for entity templates. Should only be used for non-dynamic
 * mode.
 */
export const entityPageCriterion = (
  entityId: string,
  featureName: string,
  locale: string
): ((data: any) => boolean) => {
  {
    return (data: any) => {
      if (!data.__) {
        return false;
      }
      return (
        "entityPageSet" in data.__ &&
        data.id === entityId &&
        data.__.name === featureName &&
        data.locale === locale
      );
    };
  }
};

export const getLocalEntityPageDataForSlug = async (slug: string) => {
  const localDataForSlug = await getAllLocalData((data) => {
    if (!data.__) {
      return false;
    }
    return "entityPageSet" in data.__ && "id" in data && data.slug === slug;
  });
  if (localDataForSlug.length === 0) {
    throw new Error(`No localData files match slug: ${slug}`);
  } else if (localDataForSlug.length > 1) {
    throw new Error(`Multiple localData files match slug: ${slug}, expected only a single file`);
  }
  return localDataForSlug[0].document;
};
