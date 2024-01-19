import { ViteDevServer } from "vite";
import { findTemplateModuleInternal } from "./findTemplateModuleInternal.js";
import { getLocalDataForEntityOrStaticPage } from "./getLocalData.js";

export default async function findMatchingStaticTemplate(
  vite: ViteDevServer,
  slug: string,
  templateFilepaths: string[],
  locale: string
) {
  return findTemplateModuleInternal(
    vite,
    async (t) => {
      if (t.config.templateType !== "static") {
        return false;
      }
      try {
        const document = await getLocalDataForEntityOrStaticPage({
          entityId: "",
          locale,
          featureName: t.config.name,
        });
        return slug === t.getPath({ document });
      } catch {
        return false;
      }
    },
    templateFilepaths
  );
}
