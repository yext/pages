import { ViteDevServer } from "vite";
import { isStaticTemplateConfig } from "../../../common/src/feature/features.js";
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
      if (!isStaticTemplateConfig(t.config)) {
        return false;
      }
      const document = await getLocalDataForEntityOrStaticPage({
        entityId: "",
        locale,
        featureName: t.config.name,
      });
      return slug === t.getPath({ document });
    },
    templateFilepaths
  );
}
