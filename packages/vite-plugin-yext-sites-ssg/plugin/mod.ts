import manifest from "./manifest.json" assert { type: "json" };
import { default as render } from "./assets/renderer/templateRenderer.js";

/**
 * Generate simply executes the templateRenderer function bundled as part of yss build and returns
 * the result.
 */
export const Generate = async (data): Promise<Record<any, any>> => {
  return await render({
    document: data.streamOutput,
    __meta: { manifest },
  });
};
