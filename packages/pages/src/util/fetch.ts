import { getRuntime } from "./runtime.js";

/**
 * A custom fetch implementation that determines which fetch library to use
 * depending on the current runtime. When running the local development server,
 * Node is used. Since fetch is only native starting in v18 and the version on the
 * user's machine is up to them, we need to polyfill fetch. Under the hood this
 * uses cross-fetch.
 *
 * @public
 */
const fetchInternal = async (
  input: RequestInfo,
  init?: RequestInit | undefined
): Promise<any> => {
  const runtime = getRuntime();

  // Check if running in Node 17 or less, which does not support native fetch
  if (runtime.name == "node" && runtime.getNodeMajorVersion() < 18) {
    const { default: crossFetch } = await import("cross-fetch");
    return crossFetch(input, init);
  }

  return fetch(input, init);
};

export { fetchInternal as fetch };
