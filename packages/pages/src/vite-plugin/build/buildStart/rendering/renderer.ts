import { ProjectStructure } from "../../../../common/src/project/structure.js";
import {
  Manifest,
  TemplateProps,
} from "../../../../common/src/template/types.js";
import {
  generateResponses,
  readTemplateModules,
  GeneratedPage,
  getPluginRenderTemplates,
} from "./templateUtils.js";

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
): Promise<GeneratedPage> => {
  const projectStructure = new ProjectStructure(manifest.projectStructure);
  const template = await readTemplateModules(
    props.document.__.name,
    manifest,
    projectStructure
  );
  const pluginRenderTemplates = await getPluginRenderTemplates(
    manifest,
    projectStructure
  );

  const responses = await generateResponses(
    template,
    props,
    pluginRenderTemplates,
    manifest,
    projectStructure
  );

  return responses;
};
