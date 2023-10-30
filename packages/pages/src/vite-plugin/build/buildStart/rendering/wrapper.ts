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
): Promise<string> => {
  if (!manifest) {
    throw new Error("Manifest is undefined");
  }
  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  const templateFilepath = path.join(
    projectStructure.getTemplatePaths()[0].path,
    `${templateModuleInternal.templateName}.tsx`
  );

  const serverHtml = await pluginRenderTemplates.server.render({
    Page: templateModuleInternal.default!,
    pageProps: props,
  });

  let clientHydrationString;
  if (hydrate) {
    const templatePath =
      Object.keys(manifest.clientPaths).length === 0
        ? path.join(
            projectStructure.config.subfolders.assets,
            templateModuleInternal.path.replace("..", "")
          )
        : manifest.clientPaths[templateModuleInternal.templateName];
    clientHydrationString = getHydrationTemplate(
      pluginRenderTemplates.client,
      templatePath,
      props
    );
  }

  const clientInjectedServerHtml = getServerTemplatePlugin(
    clientHydrationString,
    serverHtml,
    templateFilepath,
    manifest.bundlerManifest,
    getLang(headConfig, props),
    headConfig
  );

  return clientInjectedServerHtml;
};
