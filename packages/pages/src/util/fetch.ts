import { getRuntime } from "./runtime";

const fetchInternal = async (
  input: RequestInfo | URL,
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

/**
 * A custom fetch implementation that determines which fetch library to use
 * depending on the current runtime. When locally developing, Node is used.
 * Since fetch is only native starting in v18 and the version on the user's
 * machine is up to them, we need to polyfill fetch. Under the hood this
 * uses cross-fetch.
 *
 * @public
 */
export { fetchInternal as fetch };
