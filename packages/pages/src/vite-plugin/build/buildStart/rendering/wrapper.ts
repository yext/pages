import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import { getLang } from "../../../../common/src/template/head.js";
import { TemplateRenderProps, Manifest } from "../../../../common/src/template/types.js";
import {
  getHydrationTemplate,
  getServerTemplatePlugin,
} from "../../../../common/src/template/hydration.js";
import { PluginRenderTemplates } from "./templateUtils.js";

export const reactWrapper = async <T extends TemplateRenderProps>(
  props: T,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  hydrate: boolean,
  pluginRenderTemplates: PluginRenderTemplates,
  manifest: Manifest
): Promise<string | undefined> => {
  if (!manifest) {
    throw new Error("Manifest is undefined");
  }
  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  const templateFilepath = findOriginalTemplatePathInManifest(
    manifest,
    manifest.serverPaths[templateModuleInternal.config.name]
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
 * Finds the original template path by matching the emitted server bundle back to the Vite manifest.
 */
export const findOriginalTemplatePathInManifest = (
  manifest: Manifest,
  serverBundlePath: string | undefined
) => {
  if (!serverBundlePath) {
    console.error("Template server bundle path was not found in manifest");
    return;
  }

  const matchingEntry = Object.entries(manifest.bundlerManifest ?? {}).find(([, info]) => {
    return (
      typeof info === "object" && info !== null && "file" in info && info.file === serverBundlePath
    );
  });

  if (matchingEntry) {
    return matchingEntry[0];
  }

  console.error(`Template bundle ${serverBundlePath} not found in manifest`);
};
