import {
  generateResponses,
  readTemplateModules,
  GeneratedPage,
  Data,
} from "./templateUtils";

/**
 * This function is the main rendering function which is imported and executed in the Deno runtime
 * from plugin/mod.ts. This function loads the template module for the provided feature and
 * executes either its render function or its default-exported React component to
 * generate an HTML document. It also returns a path for the document to be stored at by
 * calling `getPath` on the template module.
 *
 * @param data The stream document for the current feature.
 */
export default async (data: Data): Promise<GeneratedPage> => {
  const manifest = data.__meta.manifest;
  const template = await readTemplateModules(data.document.feature, manifest);
  const responses = await generateResponses(template, data);

  return responses;
};
