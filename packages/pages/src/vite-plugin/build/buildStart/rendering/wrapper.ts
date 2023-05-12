import { TemplateModuleInternal } from "../../../../common/src/template/internal/types.js";
import { getLang } from "../../../../common/src/template/head.js";
import {
  TemplateRenderProps,
  RenderTemplate,
} from "../../../../common/src/template/types.js";
import {
  getHydrationTemplate,
  getServerTemplatePlugin,
} from "../../../../common/src/template/hydration.js";
import path from "path";

export const reactWrapper = async <T extends TemplateRenderProps>(
  props: T,
  templateModuleInternal: TemplateModuleInternal<any, any>,
  hydrate: boolean,
  clientRenderPath: string,
  serverRenderPath: string
): Promise<string> => {
  if (!props.__meta.manifest) {
    throw new Error("Manifest is undefined");
  }
  const projectFilepaths = props.__meta.manifest.projectFilepaths;
  const headConfig = templateModuleInternal.getHeadConfig
    ? templateModuleInternal.getHeadConfig(props)
    : undefined;

  const bundlerManifest = props.__meta.manifest.bundlerManifest;
  const rootTemplateFilepath = `${projectFilepaths.templatesRoot}/${templateModuleInternal.templateName}.tsx`;
  const scopedTemplateFilepath = `${projectFilepaths.scopedTemplatesPath}/${templateModuleInternal.templateName}.tsx`;

  const templateFilepath: string =
    !!projectFilepaths.scopedTemplatesPath &&
    bundlerManifest[scopedTemplateFilepath]
      ? scopedTemplateFilepath
      : rootTemplateFilepath;

  const relativeServerRenderPath = serverRenderPath.replace("assets", "..");
  const serverRenderTemplateModule = (await import(
    relativeServerRenderPath
  )) as RenderTemplate;

  const serverHtml = await serverRenderTemplateModule.render({
    Page: templateModuleInternal.default!,
    pageProps: props,
  });

  const clientHtml = getHydrationTemplate(
    path.join("../" + clientRenderPath),
    path.join("../assets", templateModuleInternal.path.replace("..", "")),
    props
  );

  const clientInjectedServerHtml = getServerTemplatePlugin(
    clientHtml,
    serverHtml,
    templateFilepath,
    bundlerManifest,
    props.relativePrefixToRoot,
    getLang(headConfig, props),
    headConfig
  );

  return clientInjectedServerHtml;
};
