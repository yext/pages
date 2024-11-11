import { ProjectStructure } from "../../../../common/src/project/structure.js";
import {
  Manifest,
  TemplateProps,
} from "../../../../common/src/template/types.js";
import {
  GeneratedPage,
  generateTemplateResponses,
  getPluginRenderTemplates,
  readTemplateModules,
} from "./templateUtils.js";
import {
  GeneratedRedirect,
  generateRedirectResponses,
  readRedirectModules,
} from "./redirectUtils.js";

/**
 * This function is the main rendering function which is imported and executed in the Deno runtime
 * from plugin/mod.ts. This function loads the template module for the provided feature and
 * executes either its render function or its default-exported React component to
 * generate an HTML document. It also returns a path for the document to be stored at by
 * calling `getPath` on the template module.
 *
 * @param props The stream document for the current feature.
 * @param manifest The manifest of bundled files present during production mode.
 */
export default async (
  props: TemplateProps,
  manifest: Manifest
): Promise<GeneratedPage | GeneratedRedirect> => {
  const projectStructure = new ProjectStructure(manifest.projectStructure);
  const feature = props.document.__.code_template ?? props.document.__.name;

  const template = await readTemplateModules(
    feature,
    manifest,
    projectStructure
  );
  if (template) {
    const pluginRenderTemplates = await getPluginRenderTemplates(
      manifest,
      projectStructure
    );
    return await generateTemplateResponses(
      template,
      props,
      pluginRenderTemplates,
      manifest,
      projectStructure
    );
  }

  const redirect = await readRedirectModules(
    feature,
    manifest,
    projectStructure
  );
  if (redirect) {
    return await generateRedirectResponses(redirect, props);
  }

  throw new Error(`Could not find path for feature ${feature}`);
};
