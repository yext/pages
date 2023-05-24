import { ViteDevServer } from "vite";
import { isStaticTemplateConfig } from "../../../common/src/feature/features.js";
import { findTemplateModuleInternal } from "./findTemplateModuleInternal.js";

export default async function findMatchingStaticTemplate(
  vite: ViteDevServer,
  slug: string,
  templateFilepaths: string[],
  isCustomRenderTemplate: boolean
) {
  return findTemplateModuleInternal(
    vite,
    (t) => {
      if (!isStaticTemplateConfig(t.config)) {
        return false;
      }
      return slug === t.getPath({});
    },
    templateFilepaths,
    isCustomRenderTemplate
  );
}
