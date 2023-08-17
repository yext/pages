import manifest from "./manifest.json" assert { type: "json" };

const templateRendererCache = new Map();

/**
 * Generate simply executes the templateRenderer function bundled as part of yss build and returns
 * the result.
 */
export const PagesGenerator = async (data): Promise<Record<any, any>> => {
  const subfolders = manifest.projectStructure.subfolders;
  const templateRendererPath = `./${subfolders.assets}/${subfolders.renderer}/templateRenderer.js`;

  let templateRenderer = templateRendererCache.get(templateRendererPath);
  if (!templateRenderer) {
    templateRenderer = await import(templateRendererPath);
    templateRendererCache.set(templateRendererPath, templateRenderer);
  }

  return await templateRenderer.default(
    {
      document: data.streamOutput,
      __meta: {
        mode: "production",
      },
    },
    manifest
  );
};
