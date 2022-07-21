import {
  Manifest,
  TemplateProps,
} from "../../../../common/src/template/types.js";
import {
  generateResponses,
  readTemplateModules,
  GeneratedPage,
} from "./templateUtils";

/**
 * This function is the main rendering function which is imported and executed in the Deno runtime
 * from plugin/mod.ts. This function loads the template module for the provided feature and
 * executes either its render function or its default-exported React component to
 * generate an HTML document. It also returns a path for the document to be stored at by
 * calling `getPath` on the template module.
 *
 * @param props The stream document for the current feature.
 */
export default async (props: TemplateProps): Promise<GeneratedPage> => {
  const manifest = props.__meta.manifest as Manifest;
  const template = await readTemplateModules(props.document.__.name, manifest);
  const responses = await generateResponses(template, props);

  return responses;
};
