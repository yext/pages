import {
  generateResponses,
  readTemplateModules,
  GeneratedPage,
  Document,
} from "./templateUtils.ts";

import {
  loadManifest,
} from "./manifest.ts"

/**
 * The functionality below will need to be transformed into an exported function to adhere
 * to the Yext Plugin interface. Similarly, any relative paths will need to be updated depending
 * on the final decision on where Plugin files will live.
 */

export const Generate = async (data: Document): Promise<GeneratedPage> => {
  const manifest = await loadManifest();
  const templates = await readTemplateModules(data.feature, manifest);
  const responses = await generateResponses(templates, {
    document: data,
    __meta: { manifest },
  });

  return responses;
};

