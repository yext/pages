import {
  convertRedirectModuleToRedirectModuleInternal,
  RedirectModuleInternal,
} from "../../../../common/src/redirect/internal/types.js";
import { Manifest, TemplateProps } from "../../../../common/src/template/types.js";
import { ProjectStructure } from "../../../../common/src/project/structure.js";
import { RedirectModule, RedirectSource } from "../../../../common/src/redirect/types.js";

const pathToRedirectModule = new Map<string, RedirectModule<any>>();

export type GeneratedRedirect = {
  sources: RedirectSource[];
  destination: string;
};

/**
 * @returns an array of redirect modules matching the document's feature.
 */
export const readRedirectModules = async (
  feature: string,
  manifest: Manifest,
  projectStructure: ProjectStructure
): Promise<RedirectModuleInternal<any> | undefined> => {
  if (!manifest.redirectPaths[feature]) {
    return;
  }
  const path = manifest.redirectPaths[feature].replace(
    projectStructure.config.subfolders.assets,
    ".."
  );
  let importedModule = pathToRedirectModule.get(path) as RedirectModule<any>;
  if (!importedModule) {
    importedModule = await import(path);
    pathToRedirectModule.set(path, importedModule);
  }

  return convertRedirectModuleToRedirectModuleInternal(path, importedModule, true);
};

/**
 * Takes in both a redirect module and its stream document, processes them, and writes them to disk.
 *
 * @param redirectModuleInternal
 * @param templateProps
 */
export const generateRedirectResponses = async (
  redirectModuleInternal: RedirectModuleInternal<any>,
  templateProps: TemplateProps
): Promise<GeneratedRedirect> => {
  const destination = redirectModuleInternal.getDestination(templateProps);
  const sources = redirectModuleInternal.getSources(templateProps);

  return {
    sources: sources,
    destination: destination,
  };
};
