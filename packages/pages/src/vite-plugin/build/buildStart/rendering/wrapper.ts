import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import { getLang } from "../../../../common/src/template/head.js";
import {
  TemplateRenderProps,
  Manifest,
} from "../../../../common/src/template/types.js";
import {
  getHydrationTemplate,
  getServerTemplatePlugin,
} from "../../../../common/src/template/hydration.js";
import path from "node:path";
import { PluginRenderTemplates } from "./templateUtils.js";
import { ProjectStructure } from "../../../../common/src/project/structure.js";

export const reactWrapper = async <T extends TemplateRenderProps>(
  props: T,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  hydrate: boolean,
  pluginRenderTemplates: PluginRenderTemplates,
  manifest: Manifest,
  projectStructure: ProjectStructure
): Promise<string | undefined> => {
  if (!manifest) {
    throw new Error("Manifest is undefined");
  }
  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  const templateFilepath = findOriginalTemplatePathInManifest(
    projectStructure,
    manifest,
    `${templateModuleInternal.templateName}.tsx`
  );
  if (!templateFilepath) {
    return;
  }

  let clientHydrationString;
  if (hydrate) {
    clientHydrationString = getHydrationTemplate(
      pluginRenderTemplates.client,
      manifest.clientPaths[templateModuleInternal.templateName],
      props
    );
  }

  const serverHtml = await pluginRenderTemplates.server.render({
    Page: templateModuleInternal.default!,
    pageProps: props,
  });

  const html = (
    pluginRenderTemplates.server.getIndexHtml
      ? await pluginRenderTemplates.server.getIndexHtml({
          Page: templateModuleInternal.default!,
          pageProps: props,
        })
      : pluginRenderTemplates.server.indexHtml
  ).replace(
    pluginRenderTemplates.server.getReplacementTag
      ? await pluginRenderTemplates.server.getReplacementTag()
      : pluginRenderTemplates.server.replacementTag,
    serverHtml
  );

  const clientInjectedServerHtml = getServerTemplatePlugin(
    clientHydrationString,
    html,
    templateFilepath,
    manifest.bundlerManifest,
    getLang(headConfig, props),
    headConfig
  );

  return clientInjectedServerHtml;
};

/**
 * Finds the original template path based on the template name and scope. If a scope is set it
 * first tries to find the scoped template, otherwise falls back to the root templates. Note that
 * a template of the same name cannot exist in the scoped folder and the root. The scope overrides
 * it.
 *
 * @param templateName
 * @param manifest
 */
export const findOriginalTemplatePathInManifest = (
  projectStructure: ProjectStructure,
  manifest: Manifest,
  templateName: string // with extension
) => {
  // src/templates
  const templatesRoot = path.join(
    projectStructure.config.rootFolders.source,
    projectStructure.config.subfolders.templates
  );

  if (projectStructure.config.scope) {
    const scopedFilepath = path.join(
      templatesRoot,
      projectStructure.config.scope,
      templateName
    );

    if (
      Object.keys(manifest.bundlerManifest).some((key) =>
        key.includes(scopedFilepath)
      )
    ) {
      return scopedFilepath;
    }
  }

  const filepath = path.join(templatesRoot, templateName);
  if (
    Object.keys(manifest.bundlerManifest).some((key) => key.includes(filepath))
  ) {
    return filepath;
  }

  console.error(`Template ${templateName} not found in manifest`);
};
